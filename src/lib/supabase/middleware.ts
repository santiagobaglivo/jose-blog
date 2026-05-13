import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import {
  resolveBrandFromHost,
  resolveBrandFromLocalhostSubdomain,
  resolveBrandFromSlug,
} from "@/lib/brand-domains";
import type { Database } from "@/types/database";

const GLOBAL_PATH_PREFIXES = ["/admin", "/auth", "/api", "/_next"];

function isGlobalPath(pathname: string): boolean {
  return GLOBAL_PATH_PREFIXES.some((p) => pathname.startsWith(p));
}

function firstPathSegment(pathname: string): string | null {
  const seg = pathname.split("/").filter(Boolean)[0];
  return seg ?? null;
}

function cleanHost(host: string | null | undefined): string {
  return (host ?? "").toLowerCase().replace(/:\d+$/, "");
}

/**
 * Devuelve el `domain` que se debe setear en las cookies de auth para que
 * la sesión sea válida cross-subdomain.
 *
 * - Dev: cualquier `*.localhost` o `localhost` → ".localhost" (Chrome/Firefox modernos).
 * - Prod: si `NEXT_PUBLIC_COOKIE_DOMAIN` está seteado, lo respetamos
 *   (ej. ".dominio.com"). Si no, devolvemos undefined (cookie queda por host).
 */
function authCookieDomain(host: string | null | undefined): string | undefined {
  const configured = process.env.NEXT_PUBLIC_COOKIE_DOMAIN;
  if (configured) return configured;
  const h = cleanHost(host);
  if (h === "localhost" || h.endsWith(".localhost")) return ".localhost";
  return undefined;
}

// Dev: admin.localhost(.lan) / localhost (sin subdomain).
// Prod: hostname configurado en NEXT_PUBLIC_ADMIN_HOST (ej. admin.estudio.com).
// Si no se setea NEXT_PUBLIC_ADMIN_HOST, `admin.<base>` o `admin.localhost` cuentan.
function isAdminHost(host: string | null | undefined): boolean {
  const h = cleanHost(host);
  if (!h) return false;
  const configured = process.env.NEXT_PUBLIC_ADMIN_HOST?.toLowerCase().replace(/:\d+$/, "");
  if (configured && h === configured) return true;
  if (h === "localhost" || h === "127.0.0.1") return true;
  if (h.startsWith("admin.")) return true;
  return false;
}

/**
 * Protocolo a usar en los redirects cross-host.
 * - Si el request trae `x-forwarded-proto`, lo respetamos.
 * - Si NO, asumimos `http` para sslip.io / localhost / IPs internas; `https` para todo lo demás.
 * Esto evita que un redirect a admin.<host> termine en `https://...` cuando el dominio
 * no tiene SSL configurado (sslip.io no provee certs).
 */
function safeRedirectProtocol(request: NextRequest, targetHost: string): string {
  const forwarded = request.headers.get("x-forwarded-proto");
  if (forwarded) return forwarded;
  const h = targetHost.toLowerCase().replace(/:\d+$/, "");
  if (
    h === "localhost" ||
    h.endsWith(".localhost") ||
    h.endsWith(".sslip.io") ||
    h.startsWith("127.") ||
    h.startsWith("192.168.") ||
    h.startsWith("10.") ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(h)
  ) {
    return "http";
  }
  return "https";
}

export async function updateSession(request: NextRequest) {
  const host = request.headers.get("host");
  let brand = await resolveBrandFromHost(host).catch(() => null);

  // Dev: matchear subdominios de localhost (escudotributario.localhost:3000 → brand).
  if (!brand) {
    brand = await resolveBrandFromLocalhostSubdomain(host).catch(() => null);
  }

  // Fallback dev: si el host no resuelve marca pero el path empieza con /<slug>,
  // resolvemos por slug para setear los headers x-brand-*.
  if (!brand && !isGlobalPath(request.nextUrl.pathname)) {
    const slug = firstPathSegment(request.nextUrl.pathname);
    if (slug) brand = await resolveBrandFromSlug(slug).catch(() => null);
  }

  const requestHeaders = new Headers(request.headers);
  if (brand) {
    requestHeaders.set("x-brand-id", brand.id);
    requestHeaders.set("x-brand-slug", brand.slug);
    requestHeaders.set("x-brand-name", brand.name);
    if (brand.accent_color) {
      requestHeaders.set("x-brand-accent", brand.accent_color);
    }
  }

  let supabaseResponse = NextResponse.next({
    request: { headers: requestHeaders },
  });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          const domain = authCookieDomain(host);
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request: { headers: requestHeaders },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, {
              ...options,
              ...(domain ? { domain } : {}),
            })
          );
        },
      },
    }
  );

  // No correr código entre createServerClient y getUser:
  // refresca el token y sincroniza cookies entre request y response.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    if (!user) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/auth/login";
      loginUrl.search = "";
      loginUrl.searchParams.set("redirectedFrom", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, brand_id")
      .eq("id", user.id)
      .maybeSingle();

    const role = profile?.role;
    if (role !== "admin" && role !== "superadmin") {
      const homeUrl = request.nextUrl.clone();
      homeUrl.pathname = "/";
      homeUrl.search = "";
      return NextResponse.redirect(homeUrl);
    }

    // Gating por host:
    // - superadmin: solo desde admin host (admin.* o localhost neutral).
    // - admin local: solo desde su propio brand subdomain.
    if (role === "superadmin" && !isAdminHost(host)) {
      const configuredAdmin = process.env.NEXT_PUBLIC_ADMIN_HOST;
      const port = request.nextUrl.port || "";
      const targetHost = configuredAdmin || `admin.localhost${port ? `:${port}` : ""}`;
      const protocol = safeRedirectProtocol(request, targetHost);
      const target = new URL(`${protocol}://${targetHost}${pathname}`);
      return NextResponse.redirect(target);
    }

    if (role === "admin") {
      // Admin local: el host debe matchear su brand_id.
      if (!brand || brand.id !== profile?.brand_id) {
        if (!profile?.brand_id) {
          const homeUrl = request.nextUrl.clone();
          homeUrl.pathname = "/";
          homeUrl.search = "";
          return NextResponse.redirect(homeUrl);
        }
        // Buscar el dominio público de su brand y redirigir.
        const { data: ownBrand } = await supabase
          .from("brands")
          .select("slug, domain")
          .eq("id", profile.brand_id)
          .maybeSingle();
        if (ownBrand) {
          const port = request.nextUrl.port || "";
          const targetHost =
            ownBrand.domain ||
            `${ownBrand.slug.replace(/-/g, "")}.localhost${port ? `:${port}` : ""}`;
          const protocol = safeRedirectProtocol(request, targetHost);
          const target = new URL(`${protocol}://${targetHost}${pathname}`);
          return NextResponse.redirect(target);
        }
      }
    }
  }

  // Rewrite por marca: el host resuelve a una marca y el path no es global.
  // escudotributario.pe/blog → ruta interna /escudo-tributario/blog
  // (matchea (brand)/[brand]/blog/page.tsx con params.brand="escudo-tributario").
  // Idempotente: si el path ya empieza con /<slug>, no doble-rewrite.
  if (brand && !isGlobalPath(pathname)) {
    const slugPrefix = `/${brand.slug}`;
    const alreadyRewritten =
      pathname === slugPrefix || pathname.startsWith(`${slugPrefix}/`);
    if (!alreadyRewritten) {
      const rewriteUrl = request.nextUrl.clone();
      rewriteUrl.pathname = `${slugPrefix}${pathname === "/" ? "" : pathname}`;
      const rewritten = NextResponse.rewrite(rewriteUrl, {
        request: { headers: requestHeaders },
      });
      supabaseResponse.cookies.getAll().forEach((c) => {
        rewritten.cookies.set(c.name, c.value);
      });
      return rewritten;
    }
  }

  return supabaseResponse;
}

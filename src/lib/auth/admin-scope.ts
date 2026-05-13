import { headers } from "next/headers";

import { createClient } from "@/lib/supabase/server";

/**
 * Scope del admin actual.
 *
 * - `super` sin brand: super-admin accediendo desde el host neutral (admin.*).
 *   Ve y gestiona todas las marcas. Las queries no filtran por brand.
 *
 * - `super` con brand: super-admin accediendo desde un subdomain de brand.
 *   Las queries se scopean a esa marca automáticamente (UX coherente con el host).
 *
 * - `local` con brand: admin local de una marca específica. Las queries SIEMPRE
 *   se filtran por su brand. Si intenta acceder desde otro host, el middleware
 *   lo redirige.
 *
 * - `none`: el user no es admin (o no hay sesión). Las páginas /admin/* deben
 *   tratar este caso con notFound() o redirect — el middleware ya lo gatea
 *   pero hay que ser defensivo.
 */
export type AdminScope =
  | { kind: "super"; brand: null }
  | { kind: "super"; brand: { id: string; slug: string; name: string } }
  | { kind: "local"; brand: { id: string; slug: string; name: string } }
  | { kind: "none" };

export async function getAdminScope(): Promise<AdminScope> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { kind: "none" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, brand_id")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile) return { kind: "none" };

  const isSuper = profile.role === "superadmin";
  const isLocal = profile.role === "admin";
  if (!isSuper && !isLocal) return { kind: "none" };

  // Brand resuelto por el middleware desde el host (x-brand-*).
  const h = await headers();
  const hostBrandId = h.get("x-brand-id");
  const hostBrandSlug = h.get("x-brand-slug");
  const hostBrandName = h.get("x-brand-name");
  const hostBrand =
    hostBrandId && hostBrandSlug && hostBrandName
      ? { id: hostBrandId, slug: hostBrandSlug, name: hostBrandName }
      : null;

  if (isSuper) {
    return hostBrand ? { kind: "super", brand: hostBrand } : { kind: "super", brand: null };
  }

  // Admin local: el host SIEMPRE debe coincidir con su brand (el middleware lo garantiza).
  // Si por alguna razón no hay host brand, leemos su brand_id del profile.
  if (hostBrand && profile.brand_id === hostBrand.id) {
    return { kind: "local", brand: hostBrand };
  }

  if (!profile.brand_id) {
    // admin sin brand asignado: estado inválido, lo tratamos como none.
    return { kind: "none" };
  }

  // Fallback: leer el brand del profile.
  const { data: brand } = await supabase
    .from("brands")
    .select("id, slug, name")
    .eq("id", profile.brand_id)
    .maybeSingle();
  if (!brand) return { kind: "none" };
  return { kind: "local", brand };
}

/**
 * Devuelve el brand_id por el cual filtrar queries admin.
 * - super sin brand: null (no filtrar).
 * - super en brand subdomain: ese brand.
 * - local: su brand.
 * - none: throw (el caller debe haber gateado antes).
 */
export function brandFilterFromScope(scope: AdminScope): string | null {
  if (scope.kind === "none") {
    throw new Error("brandFilterFromScope llamado sin scope admin válido");
  }
  return scope.brand?.id ?? null;
}

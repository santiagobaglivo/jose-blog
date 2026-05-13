import { cookies, headers } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import type { Database } from "@/types/database";

function authCookieDomain(host: string | null): string | undefined {
  const configured = process.env.NEXT_PUBLIC_COOKIE_DOMAIN;
  if (configured) return configured;
  if (!host) return undefined;
  const h = host.toLowerCase().replace(/:\d+$/, "");
  if (h === "localhost" || h.endsWith(".localhost")) return ".localhost";
  return undefined;
}

export async function createClient() {
  const cookieStore = await cookies();
  const h = await headers();
  const domain = authCookieDomain(h.get("host"));

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, {
                ...options,
                ...(domain ? { domain } : {}),
              });
            });
          } catch {
            // setAll fue llamado desde un Server Component. Puede ignorarse
            // si hay un proxy refrescando sesiones de usuario.
          }
        },
      },
    }
  );
}

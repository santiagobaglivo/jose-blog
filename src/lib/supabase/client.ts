import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/types/database";

/**
 * Detecta el `domain` que se debe usar al setear cookies desde el browser.
 * - Si `NEXT_PUBLIC_COOKIE_DOMAIN` está definido (ej. ".tudominio.com" en prod), lo usa.
 * - En dev, si el host es `*.localhost`, devuelve ".localhost" para que la sesión
 *   sea válida cross-subdomain.
 * - En otro caso (host único), devuelve undefined (queda por host).
 */
function clientCookieDomain(): string | undefined {
  const configured = process.env.NEXT_PUBLIC_COOKIE_DOMAIN;
  if (configured) return configured;
  if (typeof window === "undefined") return undefined;
  const h = window.location.hostname.toLowerCase();
  if (h === "localhost" || h.endsWith(".localhost")) return ".localhost";
  return undefined;
}

export function createClient() {
  const domain = clientCookieDomain();
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    domain
      ? {
          cookieOptions: {
            domain,
            path: "/",
            sameSite: "lax",
          },
        }
      : undefined
  );
}

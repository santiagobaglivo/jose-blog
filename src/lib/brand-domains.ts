import { createAdminClient } from "@/lib/supabase/admin";

export type BrandLookup = {
  id: string;
  slug: string;
  domain: string;
  name: string;
  accent_color: string | null;
};

const TTL_MS = 5 * 60 * 1000;

let cache:
  | {
      byDomain: Map<string, BrandLookup>;
      bySlug: Map<string, BrandLookup>;
      expiresAt: number;
    }
  | null = null;
let inflight: Promise<void> | null = null;

async function refreshCache(): Promise<void> {
  const supabase = createAdminClient();
  // Levantamos también las brands sin domain: en dev/localhost no hay host
  // que las identifique, pero igual se accede por path /<slug>.
  const { data, error } = await supabase
    .from("brands")
    .select("id, slug, domain, name, accent_color")
    .eq("is_active", true)
    .is("deleted_at", null);

  if (error) {
    if (cache) return;
    throw new Error(`brand-domains: ${error.message}`);
  }

  const byDomain = new Map<string, BrandLookup>();
  const bySlug = new Map<string, BrandLookup>();
  for (const row of data ?? []) {
    const lookup = {
      id: row.id,
      slug: row.slug,
      domain: row.domain ?? "",
      name: row.name,
      accent_color: row.accent_color,
    } as BrandLookup;
    if (row.domain) byDomain.set(row.domain.toLowerCase(), lookup);
    bySlug.set(row.slug, lookup);
  }
  cache = { byDomain, bySlug, expiresAt: Date.now() + TTL_MS };
}

function ensureFresh(): Promise<void> {
  if (cache && Date.now() <= cache.expiresAt) return Promise.resolve();
  if (!inflight) {
    inflight = refreshCache().finally(() => {
      inflight = null;
    });
  }
  return inflight;
}

function normalizeHost(host: string): string {
  return host.toLowerCase().replace(/:\d+$/, "");
}

export async function resolveBrandFromHost(host: string | null): Promise<BrandLookup | null> {
  if (!host) return null;
  await ensureFresh();
  if (!cache) return null;
  return cache.byDomain.get(normalizeHost(host)) ?? null;
}

export async function resolveBrandFromSlug(slug: string | null): Promise<BrandLookup | null> {
  if (!slug) return null;
  await ensureFresh();
  if (!cache) return null;
  return cache.bySlug.get(slug) ?? null;
}

/**
 * Para dev local: matchea hosts del tipo `<sub>.localhost` (con o sin puerto).
 * Resuelve `<sub>` primero como slug exacto y, si no, como slug sin guiones
 * (`escudotributario.localhost` → `escudo-tributario`).
 */
export async function resolveBrandFromLocalhostSubdomain(
  host: string | null
): Promise<BrandLookup | null> {
  if (!host) return null;
  const clean = host.toLowerCase().replace(/:\d+$/, "");
  const match = clean.match(/^([a-z0-9-]+)\.localhost$/);
  if (!match) return null;
  const sub = match[1];

  await ensureFresh();
  if (!cache) return null;
  const exact = cache.bySlug.get(sub);
  if (exact) return exact;
  for (const [slug, brand] of cache.bySlug) {
    if (slug.replace(/-/g, "") === sub) return brand;
  }
  return null;
}

export function invalidateBrandDomainsCache(): void {
  cache = null;
}

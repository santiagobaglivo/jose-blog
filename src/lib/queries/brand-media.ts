import { getAdminScope, type AdminScope } from "@/lib/auth/admin-scope";
import { createAdminClient } from "@/lib/supabase/admin";

export type BrandMediaKind = "image" | "video" | "document" | "embed";

export interface AdminBrandMediaRow {
  id: string;
  brand_id: string;
  brand: { id: string; name: string; slug: string };
  kind: BrandMediaKind;
  url: string;
  thumbnail_url: string | null;
  title: string | null;
  description: string | null;
  mime_type: string | null;
  size_bytes: number | null;
  duration_seconds: number | null;
  embed_provider: string | null;
  embed_html: string | null;
  created_at: string;
}

/**
 * Listado completo de la galería para el panel admin. Scopeado igual que
 * getAllBrandPagesAdmin:
 *  - super sin brand: todas las marcas.
 *  - super en brand o admin local: solo su brand.
 */
export async function getBrandMedia(scope?: AdminScope): Promise<AdminBrandMediaRow[]> {
  const effectiveScope = scope ?? (await getAdminScope());
  if (effectiveScope.kind === "none") return [];

  const supabase = createAdminClient();
  let query = supabase
    .from("brand_media")
    .select(
      `id, brand_id, kind, url, thumbnail_url, title, description, mime_type,
       size_bytes, duration_seconds, embed_provider, embed_html, created_at,
       brand:brands!brand_media_brand_id_fkey ( id, name, slug )`
    )
    .order("created_at", { ascending: false });

  if (effectiveScope.brand) query = query.eq("brand_id", effectiveScope.brand.id);

  const { data, error } = await query;
  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    brand_id: row.brand_id,
    brand: {
      id: row.brand?.id ?? "",
      name: row.brand?.name ?? "—",
      slug: row.brand?.slug ?? "",
    },
    kind: row.kind as BrandMediaKind,
    url: row.url,
    thumbnail_url: row.thumbnail_url,
    title: row.title,
    description: row.description,
    mime_type: row.mime_type,
    size_bytes: row.size_bytes,
    duration_seconds: row.duration_seconds,
    embed_provider: row.embed_provider,
    embed_html: row.embed_html,
    created_at: row.created_at,
  }));
}

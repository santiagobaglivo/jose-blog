import { getAdminScope, type AdminScope } from "@/lib/auth/admin-scope";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type BrandPageStatus = "draft" | "published" | "archived";

export interface BrandPageMenuItem {
  id: string;
  slug: string;
  title: string;
  menu_order: number;
}

export interface BrandPagePublic {
  id: string;
  brand_id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  content_html: string;
  hero_image: string | null;
  seo_title: string | null;
  seo_description: string | null;
  updated_at: string;
}

export interface AdminBrandPageRow {
  id: string;
  brand_id: string;
  brand: { id: string; name: string; slug: string };
  slug: string;
  title: string;
  status: BrandPageStatus;
  show_in_menu: boolean;
  menu_order: number;
  updated_at: string;
}

/**
 * Páginas que aparecen en el menú público de la brand.
 * Solo published + show_in_menu, ordenadas por menu_order asc.
 * Pensado para llamarse desde el layout/header de cada brand (Server Component).
 */
export async function getMenuPagesForBrand(brandId: string): Promise<BrandPageMenuItem[]> {
  if (!brandId) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("brand_pages")
    .select("id, slug, title, menu_order")
    .eq("brand_id", brandId)
    .eq("show_in_menu", true)
    .eq("status", "published")
    .is("deleted_at", null)
    .order("menu_order", { ascending: true })
    .order("title", { ascending: true });

  if (error || !data) return [];
  return data;
}

/**
 * Detalle público de una página por brandSlug + pageSlug.
 * Devuelve null si la página no existe, no está publicada, está borrada o el
 * brand está inactivo.
 */
export async function getBrandPageBySlug(
  brandSlug: string,
  pageSlug: string
): Promise<BrandPagePublic | null> {
  const supabase = await createClient();
  const { data: brand } = await supabase
    .from("brands")
    .select("id")
    .eq("slug", brandSlug)
    .eq("is_active", true)
    .is("deleted_at", null)
    .maybeSingle();
  if (!brand) return null;

  const { data, error } = await supabase
    .from("brand_pages")
    .select(
      "id, brand_id, slug, title, subtitle, content_html, hero_image, seo_title, seo_description, updated_at"
    )
    .eq("brand_id", brand.id)
    .eq("slug", pageSlug)
    .eq("status", "published")
    .is("deleted_at", null)
    .maybeSingle();

  if (error || !data) return null;
  return data;
}

/**
 * Listado completo para el panel admin. Scopeado:
 * - super sin brand: ve todas las páginas de todas las marcas.
 * - super en brand o admin local: solo SU brand.
 */
export async function getAllBrandPagesAdmin(scope?: AdminScope): Promise<AdminBrandPageRow[]> {
  const effectiveScope = scope ?? (await getAdminScope());
  if (effectiveScope.kind === "none") return [];

  const supabase = createAdminClient();
  let query = supabase
    .from("brand_pages")
    .select(
      `id, brand_id, slug, title, status, show_in_menu, menu_order, updated_at,
       brand:brands!brand_pages_brand_id_fkey ( id, name, slug )`
    )
    .is("deleted_at", null)
    .order("menu_order", { ascending: true })
    .order("updated_at", { ascending: false });

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
    slug: row.slug,
    title: row.title,
    status: row.status as BrandPageStatus,
    show_in_menu: row.show_in_menu,
    menu_order: row.menu_order,
    updated_at: row.updated_at,
  }));
}

import { getAdminScope } from "@/lib/auth/admin-scope";
import { getBrandContext } from "@/lib/auth/brand-context";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Category, Tag } from "@/types/blog";

export async function getCategories(): Promise<Category[]> {
  const brand = await getBrandContext();
  if (!brand) return [];

  const supabase = createAdminClient();
  const { data: cats, error } = await supabase
    .from("categories")
    .select("id, slug, name, description")
    .eq("brand_id", brand.id)
    .order("display_order", { ascending: true });
  if (error || !cats) return [];

  // Conteo de posts publicados por categoría.
  const { data: counts } = await supabase
    .from("posts")
    .select("category_id")
    .eq("brand_id", brand.id)
    .eq("status", "published")
    .is("deleted_at", null);

  const byCat = new Map<string, number>();
  for (const row of counts ?? []) {
    if (row.category_id) byCat.set(row.category_id, (byCat.get(row.category_id) ?? 0) + 1);
  }

  return cats.map((c) => ({
    slug: c.slug,
    name: c.name,
    description: c.description ?? "",
    count: byCat.get(c.id) ?? 0,
  }));
}

export async function getTags(): Promise<Tag[]> {
  const brand = await getBrandContext();
  if (!brand) return [];

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("tags")
    .select("slug, name")
    .eq("brand_id", brand.id)
    .order("name", { ascending: true });
  if (error || !data) return [];
  return data;
}

// ============================================================================
// Admin: vistas globales (todas las marcas).
// ============================================================================

export interface AdminCategoryRow extends Category {
  id: string;
  brand: { id: string; slug: string; name: string };
}

export async function getCategoriesAdmin(): Promise<AdminCategoryRow[]> {
  const scope = await getAdminScope();
  if (scope.kind === "none") return [];
  const supabase = createAdminClient();

  let catQuery = supabase
    .from("categories")
    .select("id, slug, name, description, brand:brands ( id, slug, name )")
    .order("display_order", { ascending: true });
  if (scope.brand) catQuery = catQuery.eq("brand_id", scope.brand.id);
  const { data: cats, error } = await catQuery;
  if (error || !cats) return [];

  let countsQuery = supabase
    .from("posts")
    .select("category_id")
    .eq("status", "published")
    .is("deleted_at", null);
  if (scope.brand) countsQuery = countsQuery.eq("brand_id", scope.brand.id);
  const { data: counts } = await countsQuery;

  const byCat = new Map<string, number>();
  for (const row of counts ?? []) {
    if (row.category_id) byCat.set(row.category_id, (byCat.get(row.category_id) ?? 0) + 1);
  }

  return cats.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    description: c.description ?? "",
    count: byCat.get(c.id) ?? 0,
    brand: {
      id: c.brand?.id ?? "",
      slug: c.brand?.slug ?? "",
      name: c.brand?.name ?? "",
    },
  }));
}

export interface AdminTagRow extends Tag {
  id: string;
  brand: { id: string; slug: string; name: string };
}

export async function getTagsAdmin(): Promise<AdminTagRow[]> {
  const scope = await getAdminScope();
  if (scope.kind === "none") return [];
  const supabase = createAdminClient();
  let query = supabase
    .from("tags")
    .select("id, slug, name, brand:brands ( id, slug, name )")
    .order("name", { ascending: true });
  if (scope.brand) query = query.eq("brand_id", scope.brand.id);
  const { data, error } = await query;
  if (error || !data) return [];
  return data.map((t) => ({
    id: t.id,
    slug: t.slug,
    name: t.name,
    brand: {
      id: t.brand?.id ?? "",
      slug: t.brand?.slug ?? "",
      name: t.brand?.name ?? "",
    },
  }));
}

import { getAdminScope } from "@/lib/auth/admin-scope";
import { createAdminClient } from "@/lib/supabase/admin";
import { PostForm } from "../post-form";

export default async function NuevoArticuloPage() {
  const scope = await getAdminScope();
  if (scope.kind === "none") {
    return (
      <div className="text-[0.875rem] text-muted-foreground">
        Necesitás permisos de admin para crear artículos.
      </div>
    );
  }

  const supabase = createAdminClient();
  const brandId = scope.brand?.id ?? null;

  // Categories y tags scopeadas al brand activo (si hay).
  const catsQuery = supabase.from("categories").select("id, name, slug").order("display_order");
  const tagsQuery = supabase.from("tags").select("id, name, slug").order("name");
  const brandsQuery = supabase
    .from("brands")
    .select("id, name, slug")
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("display_order");

  const [{ data: cats }, { data: tags }, { data: brands }] = await Promise.all([
    brandId ? catsQuery.eq("brand_id", brandId) : catsQuery,
    brandId ? tagsQuery.eq("brand_id", brandId) : tagsQuery,
    brandId ? brandsQuery.eq("id", brandId) : brandsQuery,
  ]);

  return (
    <PostForm
      defaults={{
        title: "",
        subtitle: "",
        excerpt: "",
        contentHtml: "<h2>Subtítulo</h2>\n<p>Comienza a escribir aquí…</p>",
        featuredImage: "",
        categoryId: "",
        tagIds: [],
        status: "draft",
        scheduledFor: "",
        brandId: scope.brand?.id,
      }}
      categories={cats ?? []}
      tags={tags ?? []}
      brands={brands ?? []}
      brandRequired={scope.kind === "super" && !scope.brand}
    />
  );
}

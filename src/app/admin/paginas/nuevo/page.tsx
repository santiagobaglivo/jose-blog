import { getAdminScope } from "@/lib/auth/admin-scope";
import { createAdminClient } from "@/lib/supabase/admin";
import { PageForm } from "../page-form";

export default async function NuevaPaginaPage() {
  const scope = await getAdminScope();
  if (scope.kind === "none") {
    return (
      <div className="text-[0.875rem] text-muted-foreground">
        Necesitás permisos de admin para crear páginas.
      </div>
    );
  }

  const supabase = createAdminClient();
  const brandId = scope.brand?.id ?? null;

  const brandsQuery = supabase
    .from("brands")
    .select("id, name, slug")
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("display_order");

  const { data: brands } = await (brandId ? brandsQuery.eq("id", brandId) : brandsQuery);

  return (
    <PageForm
      defaults={{
        brandId: scope.brand?.id,
        title: "",
        slug: "",
        subtitle: "",
        contentHtml: "<h2>Subtítulo</h2>\n<p>Comienza a escribir aquí…</p>",
        heroImage: "",
        showInMenu: true,
        menuOrder: 0,
        status: "published",
        seoTitle: "",
        seoDescription: "",
      }}
      brands={brands ?? []}
      brandRequired={scope.kind === "super" && !scope.brand}
    />
  );
}

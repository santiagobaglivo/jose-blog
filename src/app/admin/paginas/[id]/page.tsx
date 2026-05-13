import { notFound } from "next/navigation";

import { getAdminScope } from "@/lib/auth/admin-scope";
import { createAdminClient } from "@/lib/supabase/admin";
import { PageForm } from "../page-form";

export default async function EditarPaginaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const scope = await getAdminScope();
  if (scope.kind === "none") notFound();

  const supabase = createAdminClient();

  const { data: page } = await supabase
    .from("brand_pages")
    .select(
      `id, brand_id, slug, title, subtitle, content_html, hero_image,
       show_in_menu, menu_order, status, seo_title, seo_description`
    )
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();
  if (!page) notFound();

  // Admin local: solo puede editar páginas de SU brand.
  if (scope.kind === "local" && scope.brand && page.brand_id !== scope.brand.id) {
    notFound();
  }

  const { data: brands } = await supabase
    .from("brands")
    .select("id, name, slug")
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("display_order");

  return (
    <PageForm
      defaults={{
        pageId: page.id,
        brandId: page.brand_id,
        title: page.title,
        slug: page.slug,
        subtitle: page.subtitle ?? "",
        contentHtml: page.content_html,
        heroImage: page.hero_image ?? "",
        showInMenu: page.show_in_menu,
        menuOrder: page.menu_order,
        status: page.status as "draft" | "published" | "archived",
        seoTitle: page.seo_title ?? "",
        seoDescription: page.seo_description ?? "",
      }}
      brands={brands ?? []}
      brandRequired={false}
    />
  );
}

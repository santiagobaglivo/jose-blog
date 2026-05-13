import { notFound } from "next/navigation";

import { getAdminScope } from "@/lib/auth/admin-scope";
import { createAdminClient } from "@/lib/supabase/admin";
import { PostForm } from "../post-form";

export default async function EditarArticuloPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const scope = await getAdminScope();
  if (scope.kind === "none") notFound();

  const supabase = createAdminClient();

  const { data: post } = await supabase
    .from("posts")
    .select(
      `id, brand_id, title, subtitle, excerpt, content_html, featured_image, category_id,
       status, scheduled_for,
       post_tags ( tag_id )`
    )
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();
  if (!post) notFound();

  // Si admin local, verificar que el post sea de su brand.
  if (scope.kind === "local" && scope.brand && post.brand_id !== scope.brand.id) {
    notFound();
  }

  const [{ data: cats }, { data: tags }, { data: brands }] = await Promise.all([
    supabase
      .from("categories")
      .select("id, name, slug")
      .eq("brand_id", post.brand_id)
      .order("display_order"),
    supabase
      .from("tags")
      .select("id, name, slug")
      .eq("brand_id", post.brand_id)
      .order("name"),
    supabase
      .from("brands")
      .select("id, name, slug")
      .eq("is_active", true)
      .is("deleted_at", null)
      .order("display_order"),
  ]);

  const selectedTagIds = (post.post_tags ?? []).map((row) => row.tag_id);

  return (
    <PostForm
      defaults={{
        postId: post.id,
        brandId: post.brand_id,
        title: post.title,
        subtitle: post.subtitle ?? "",
        excerpt: post.excerpt,
        contentHtml: post.content_html,
        featuredImage: post.featured_image ?? "",
        categoryId: post.category_id ?? "",
        tagIds: selectedTagIds,
        status: post.status === "archived" ? "draft" : (post.status as "draft" | "scheduled" | "published"),
        scheduledFor: post.scheduled_for ?? "",
      }}
      categories={cats ?? []}
      tags={tags ?? []}
      brands={brands ?? []}
      brandRequired={false}
    />
  );
}

import { posts, dashboardStats, type Post } from "@/lib/mock-data";
import { createClient } from "@/lib/supabase/server";

export async function getPublishedPosts(): Promise<Post[]> {
  return posts.filter((p) => p.status === "publicado");
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  return posts.find((p) => p.slug === slug) ?? null;
}

export async function getRelatedPosts(slug: string, limit = 4): Promise<Post[]> {
  return posts.filter((p) => p.status === "publicado" && p.slug !== slug).slice(0, limit);
}

export async function getDraftPosts(): Promise<Post[]> {
  return posts.filter((p) => p.status === "borrador");
}

export async function getScheduledPosts(): Promise<Post[]> {
  return posts.filter((p) => p.status === "programado");
}

export type AdminPostStatus = "draft" | "scheduled" | "published" | "archived";

export interface AdminPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  status: AdminPostStatus;
  category: { id: string; name: string; slug: string } | null;
  author: { id: string; name: string };
  publishedAt: string | null;
  scheduledFor: string | null;
  updatedAt: string;
}

export interface AdminPostsFilters {
  status?: AdminPostStatus;
  category?: string;
  search?: string;
}

export async function getAllPostsAdmin(filters: AdminPostsFilters = {}): Promise<AdminPost[]> {
  const supabase = await createClient();

  let categoryId: string | null = null;
  if (filters.category) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", filters.category)
      .maybeSingle();
    if (!cat) return [];
    categoryId = cat.id;
  }

  let query = supabase
    .from("posts")
    .select(
      `id, slug, title, excerpt, status, published_at, scheduled_for, updated_at,
       category:categories ( id, name, slug ),
       author:profiles!posts_author_id_fkey ( id, display_name )`
    )
    .is("deleted_at", null)
    .order("updated_at", { ascending: false });

  if (filters.status) query = query.eq("status", filters.status);
  if (categoryId) query = query.eq("category_id", categoryId);

  const search = filters.search?.trim();
  if (search) {
    query = query.textSearch("search_vector", search, {
      type: "websearch",
      config: "spanish",
    });
  }

  const { data, error } = await query;
  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    status: row.status as AdminPostStatus,
    category: row.category
      ? { id: row.category.id, name: row.category.name, slug: row.category.slug }
      : null,
    author: {
      id: row.author?.id ?? "",
      name: row.author?.display_name ?? "—",
    },
    publishedAt: row.published_at,
    scheduledFor: row.scheduled_for,
    updatedAt: row.updated_at,
  }));
}

export async function getDashboardStats(): Promise<typeof dashboardStats> {
  return dashboardStats;
}

import { getAdminScope } from "@/lib/auth/admin-scope";
import { getBrandContext } from "@/lib/auth/brand-context";
import {
  formatLongDate,
  initialsFromName,
  postStatusDbToUi,
  readTimeLabel,
} from "@/lib/format";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { Post } from "@/types/blog";

// ============================================================================
// Helpers de mapeo DB → shape público.
// ============================================================================

type RawPostRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content_html: string;
  featured_image: string | null;
  read_time_minutes: number | null;
  status: "draft" | "scheduled" | "published" | "archived";
  published_at: string | null;
  scheduled_for: string | null;
  category: { slug: string } | null;
  author: { display_name: string | null; role: "admin" | "user" } | null;
  post_tags: { tags: { slug: string } | null }[] | null;
};

function mapPostRow(row: RawPostRow): Post {
  const tagSlugs = (row.post_tags ?? [])
    .map((pt) => pt.tags?.slug)
    .filter((s): s is string => Boolean(s));

  const isPublished = row.status === "published";
  const isScheduled = row.status === "scheduled";
  const dateIso = isPublished ? row.published_at : isScheduled ? row.scheduled_for : null;

  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content_html,
    image: row.featured_image ?? "",
    category: row.category?.slug ?? "",
    tags: tagSlugs,
    author: {
      name: row.author?.display_name ?? "—",
      role: row.author?.role === "admin" ? "Equipo profesional" : "Usuario",
      avatar: initialsFromName(row.author?.display_name),
    },
    date: dateIso ? formatLongDate(dateIso) : "",
    readTime: readTimeLabel(row.read_time_minutes),
    status: postStatusDbToUi(row.status),
    scheduledDate: isScheduled && row.scheduled_for ? formatLongDate(row.scheduled_for) : undefined,
    commentCount: 0,
  };
}

const POST_SELECT = `
  id, slug, title, excerpt, content_html, featured_image, read_time_minutes,
  status, published_at, scheduled_for,
  category:categories ( slug ),
  author:profiles!posts_author_id_fkey ( display_name, role ),
  post_tags ( tags ( slug ) )
`;

// ============================================================================
// Queries públicas (brand-scoped por el context del request).
// ============================================================================

export interface PublishedPostsFilters {
  q?: string;
  categorySlug?: string;
  tagSlug?: string;
  year?: number;
  month?: number; // 1-12
  page?: number;
  perPage?: number;
}

/**
 * Devuelve el "archivo" del blog agrupado por año/mes para el sidebar tipo Blogspot.
 */
export async function getPostsArchive(): Promise<
  Array<{ year: number; month: number; label: string; count: number }>
> {
  const brand = await getBrandContext();
  if (!brand) return [];
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("posts")
    .select("published_at")
    .eq("brand_id", brand.id)
    .eq("status", "published")
    .is("deleted_at", null)
    .not("published_at", "is", null)
    .order("published_at", { ascending: false });

  if (!data) return [];

  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
  ];

  const counts = new Map<string, { year: number; month: number; count: number }>();
  for (const row of data) {
    if (!row.published_at) continue;
    const d = new Date(row.published_at);
    const year = d.getFullYear();
    const month = d.getMonth();
    const key = `${year}-${month}`;
    const slot = counts.get(key) ?? { year, month, count: 0 };
    slot.count += 1;
    counts.set(key, slot);
  }

  return Array.from(counts.values())
    .sort((a, b) => b.year - a.year || b.month - a.month)
    .map(({ year, month, count }) => ({
      year,
      month: month + 1,
      label: `${months[month]} ${year}`,
      count,
    }));
}

export async function getPublishedPosts(
  filters: PublishedPostsFilters = {}
): Promise<{ items: Post[]; total: number; page: number; perPage: number }> {
  const brand = await getBrandContext();
  const perPage = Math.max(1, Math.min(50, filters.perPage ?? 9));
  const page = Math.max(1, filters.page ?? 1);
  if (!brand) return { items: [], total: 0, page, perPage };

  const supabase = createAdminClient();

  // Resolver category/tag a IDs (separado para no romper la inferencia del builder).
  let categoryId: string | null = null;
  if (filters.categorySlug) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("brand_id", brand.id)
      .eq("slug", filters.categorySlug)
      .maybeSingle();
    if (!cat) return { items: [], total: 0, page, perPage };
    categoryId = cat.id;
  }

  let tagPostIds: string[] | null = null;
  if (filters.tagSlug) {
    const { data: tag } = await supabase
      .from("tags")
      .select("id")
      .eq("brand_id", brand.id)
      .eq("slug", filters.tagSlug)
      .maybeSingle();
    if (!tag) return { items: [], total: 0, page, perPage };
    const { data: tagged } = await supabase
      .from("post_tags")
      .select("post_id")
      .eq("tag_id", tag.id);
    tagPostIds = (tagged ?? []).map((r) => r.post_id);
    if (tagPostIds.length === 0) return { items: [], total: 0, page, perPage };
  }

  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let query = supabase
    .from("posts")
    .select(POST_SELECT, { count: "exact" })
    .eq("brand_id", brand.id)
    .eq("status", "published")
    .is("deleted_at", null)
    .order("published_at", { ascending: false });

  if (filters.q) {
    query = query.textSearch("search_vector", filters.q, {
      type: "websearch",
      config: "spanish",
    });
  }
  if (categoryId) query = query.eq("category_id", categoryId);
  if (tagPostIds) query = query.in("id", tagPostIds);
  if (filters.year && filters.month) {
    const fromIso = new Date(filters.year, filters.month - 1, 1).toISOString();
    const toIso = new Date(filters.year, filters.month, 1).toISOString();
    query = query.gte("published_at", fromIso).lt("published_at", toIso);
  } else if (filters.year) {
    const fromIso = new Date(filters.year, 0, 1).toISOString();
    const toIso = new Date(filters.year + 1, 0, 1).toISOString();
    query = query.gte("published_at", fromIso).lt("published_at", toIso);
  }

  const { data, error, count } = await query.range(from, to);
  if (error || !data) return { items: [], total: 0, page, perPage };
  return {
    items: data.map((row) => mapPostRow(row as unknown as RawPostRow)),
    total: count ?? data.length,
    page,
    perPage,
  };
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const brand = await getBrandContext();
  if (!brand) return null;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("posts")
    .select(POST_SELECT)
    .eq("brand_id", brand.id)
    .eq("slug", slug)
    .eq("status", "published")
    .is("deleted_at", null)
    .maybeSingle();

  if (error || !data) return null;
  return mapPostRow(data as unknown as RawPostRow);
}

export async function getRelatedPosts(slug: string, limit = 4): Promise<Post[]> {
  const brand = await getBrandContext();
  if (!brand) return [];

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("posts")
    .select(POST_SELECT)
    .eq("brand_id", brand.id)
    .eq("status", "published")
    .is("deleted_at", null)
    .neq("slug", slug)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data.map((row) => mapPostRow(row as unknown as RawPostRow));
}

// ============================================================================
// Queries admin (globales — toda marca).
// ============================================================================

export async function getDraftPosts(): Promise<Post[]> {
  const scope = await getAdminScope();
  if (scope.kind === "none") return [];
  const supabase = createAdminClient();
  let query = supabase
    .from("posts")
    .select(POST_SELECT)
    .eq("status", "draft")
    .is("deleted_at", null)
    .order("updated_at", { ascending: false });
  if (scope.brand) query = query.eq("brand_id", scope.brand.id);
  const { data, error } = await query;
  if (error || !data) return [];
  return data.map((row) => mapPostRow(row as unknown as RawPostRow));
}

export async function getScheduledPosts(): Promise<Post[]> {
  const scope = await getAdminScope();
  if (scope.kind === "none") return [];
  const supabase = createAdminClient();
  let query = supabase
    .from("posts")
    .select(POST_SELECT)
    .eq("status", "scheduled")
    .is("deleted_at", null)
    .order("scheduled_for", { ascending: true });
  if (scope.brand) query = query.eq("brand_id", scope.brand.id);
  const { data, error } = await query;
  if (error || !data) return [];
  return data.map((row) => mapPostRow(row as unknown as RawPostRow));
}

export type AdminPostStatus = "draft" | "scheduled" | "published" | "archived";

export interface AdminPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  status: AdminPostStatus;
  brand: { id: string; name: string; slug: string };
  category: { id: string; name: string; slug: string } | null;
  author: { id: string; name: string };
  publishedAt: string | null;
  scheduledFor: string | null;
  updatedAt: string;
}

export interface AdminPostsFilters {
  brandId?: string;
  status?: AdminPostStatus;
  category?: string;
  search?: string;
}

export async function getAllPostsAdmin(filters: AdminPostsFilters = {}): Promise<AdminPost[]> {
  const supabase = await createClient();
  const scope = await getAdminScope();
  if (scope.kind === "none") return [];

  // Scope automático: admin local o super en brand subdomain → filtrar por su brand.
  // El filtro explícito de filters.brandId solo se respeta para super sin scope.
  const scopedBrandId = scope.brand?.id ?? null;
  const effectiveBrandId = scopedBrandId ?? filters.brandId ?? null;

  let categoryId: string | null = null;
  if (filters.category) {
    let catQuery = supabase.from("categories").select("id").eq("slug", filters.category);
    if (effectiveBrandId) catQuery = catQuery.eq("brand_id", effectiveBrandId);
    const { data: cat } = await catQuery.maybeSingle();
    if (!cat) return [];
    categoryId = cat.id;
  }

  let query = supabase
    .from("posts")
    .select(
      `id, slug, title, excerpt, status, published_at, scheduled_for, updated_at,
       brand:brands!posts_brand_id_fkey ( id, name, slug ),
       category:categories ( id, name, slug ),
       author:profiles!posts_author_id_fkey ( id, display_name )`
    )
    .is("deleted_at", null)
    .order("updated_at", { ascending: false });

  if (effectiveBrandId) query = query.eq("brand_id", effectiveBrandId);
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
    brand: {
      id: row.brand?.id ?? "",
      name: row.brand?.name ?? "—",
      slug: row.brand?.slug ?? "",
    },
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

// ============================================================================
// Dashboard stats (vista global del admin).
// ============================================================================

export interface DashboardStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  scheduledPosts: number;
  totalComments: number;
  pendingComments: number;
  totalThreads: number;
  totalUsers: number;
  monthlyViews: number;
  viewsTrend: string;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const scope = await getAdminScope();
  if (scope.kind === "none") {
    return {
      totalPosts: 0,
      publishedPosts: 0,
      draftPosts: 0,
      scheduledPosts: 0,
      totalComments: 0,
      pendingComments: 0,
      totalThreads: 0,
      totalUsers: 0,
      monthlyViews: 0,
      viewsTrend: "+0%",
    };
  }

  const supabase = createAdminClient();
  const brandId = scope.brand?.id ?? null;

  const postsQ = supabase.from("posts").select("status", { count: "exact" }).is("deleted_at", null);
  const commentsQ = supabase
    .from("comments")
    .select("status", { count: "exact" })
    .is("deleted_at", null);
  const threadsQ = supabase
    .from("forum_threads")
    .select("id", { count: "exact" })
    .is("deleted_at", null);
  const usersQ = supabase.from("profiles").select("id", { count: "exact" });
  const viewsQ = supabase
    .from("posts")
    .select("view_count")
    .is("deleted_at", null)
    .eq("status", "published");

  const [posts, comments, threads, users, views] = await Promise.all([
    brandId ? postsQ.eq("brand_id", brandId) : postsQ,
    brandId ? commentsQ.eq("brand_id", brandId) : commentsQ,
    brandId ? threadsQ.eq("brand_id", brandId) : threadsQ,
    brandId ? usersQ.eq("brand_id", brandId) : usersQ,
    brandId ? viewsQ.eq("brand_id", brandId) : viewsQ,
  ]);

  const postRows = (posts.data ?? []) as { status: string }[];
  const commentRows = (comments.data ?? []) as { status: string }[];

  return {
    totalPosts: posts.count ?? postRows.length,
    publishedPosts: postRows.filter((p) => p.status === "published").length,
    draftPosts: postRows.filter((p) => p.status === "draft").length,
    scheduledPosts: postRows.filter((p) => p.status === "scheduled").length,
    totalComments: comments.count ?? commentRows.length,
    pendingComments: commentRows.filter((c) => c.status === "pending").length,
    totalThreads: threads.count ?? 0,
    totalUsers: users.count ?? 0,
    monthlyViews: (views.data ?? []).reduce((acc, p) => acc + (p.view_count ?? 0), 0),
    viewsTrend: "+0%",
  };
}

import { getAdminScope } from "@/lib/auth/admin-scope";
import { getBrandContext } from "@/lib/auth/brand-context";
import { formatLongDate, formatRelative, initialsFromName } from "@/lib/format";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ForumCategory, Reply, Thread } from "@/types/blog";

// ============================================================================
// Forum categories
// ============================================================================

type RawForumCategoryRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  parent_id?: string | null;
};

async function aggregateCategoryStats(
  brandId: string,
  categoryIds: string[]
): Promise<
  Map<
    string,
    { threadCount: number; replyCount: number; lastActivity: string; lastAuthor: string }
  >
> {
  const result = new Map<
    string,
    { threadCount: number; replyCount: number; lastActivity: string; lastAuthor: string }
  >();
  if (categoryIds.length === 0) return result;

  const supabase = createAdminClient();

  // Threads por categoría (count + último).
  const { data: threads } = await supabase
    .from("forum_threads")
    .select(
      `id, category_id, reply_count, last_reply_at, created_at,
       last_author:profiles!forum_threads_last_reply_by_fkey ( display_name ),
       author:profiles!forum_threads_author_id_fkey ( display_name )`
    )
    .eq("brand_id", brandId)
    .is("deleted_at", null)
    .in("category_id", categoryIds);

  for (const cid of categoryIds) {
    result.set(cid, { threadCount: 0, replyCount: 0, lastActivity: "", lastAuthor: "" });
  }

  // Latest activity tracking per category.
  const latestByCat = new Map<string, { iso: string; author: string }>();

  for (const t of threads ?? []) {
    const slot = result.get(t.category_id);
    if (!slot) continue;
    slot.threadCount += 1;
    slot.replyCount += t.reply_count ?? 0;

    const activityIso = t.last_reply_at ?? t.created_at;
    const author =
      (t.last_reply_at
        ? (t as { last_author: { display_name: string | null } | null }).last_author?.display_name
        : (t as { author: { display_name: string | null } | null }).author?.display_name) ?? "";
    const current = latestByCat.get(t.category_id);
    if (!current || (activityIso && activityIso > current.iso)) {
      latestByCat.set(t.category_id, { iso: activityIso ?? "", author });
    }
  }

  for (const [cid, info] of latestByCat) {
    const slot = result.get(cid)!;
    slot.lastActivity = info.iso ? formatRelative(info.iso) : "";
    slot.lastAuthor = info.author;
  }

  return result;
}

export async function getForumCategories(): Promise<ForumCategory[]> {
  const brand = await getBrandContext();
  if (!brand) return [];

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("forum_categories")
    .select("id, slug, name, description, icon, parent_id")
    .eq("brand_id", brand.id)
    .order("display_order", { ascending: true });
  if (error || !data) return [];

  const stats = await aggregateCategoryStats(
    brand.id,
    (data as RawForumCategoryRow[]).map((c) => c.id)
  );

  const allRows = data as RawForumCategoryRow[];
  // Mapas para resolver parentSlug y subcategorySlugs.
  const slugById = new Map<string, string>();
  for (const c of allRows) slugById.set(c.id, c.slug);
  const childrenByParent = new Map<string, string[]>();
  for (const c of allRows) {
    if (c.parent_id) {
      const slot = childrenByParent.get(c.parent_id) ?? [];
      slot.push(c.slug);
      childrenByParent.set(c.parent_id, slot);
    }
  }

  return allRows.map((c) => {
    const s = stats.get(c.id) ?? { threadCount: 0, replyCount: 0, lastActivity: "", lastAuthor: "" };
    return {
      slug: c.slug,
      name: c.name,
      description: c.description ?? "",
      icon: c.icon ?? "help-circle",
      threadCount: s.threadCount,
      replyCount: s.replyCount,
      lastActivity: s.lastActivity,
      lastAuthor: s.lastAuthor,
      parentSlug: c.parent_id ? slugById.get(c.parent_id) ?? null : null,
      subcategorySlugs: childrenByParent.get(c.id) ?? [],
    };
  });
}

export async function getForumCategoryBySlug(slug: string): Promise<ForumCategory | null> {
  const all = await getForumCategories();
  return all.find((c) => c.slug === slug) ?? null;
}

// ============================================================================
// Forum threads
// ============================================================================

type RawThreadRow = {
  id: string;
  slug: string;
  title: string;
  content: string;
  pinned: boolean;
  view_count: number;
  reply_count: number;
  created_at: string;
  last_reply_at: string | null;
  author: { display_name: string | null } | null;
  category: { slug: string } | null;
  last_author: { display_name: string | null } | null;
};

const THREAD_SELECT = `
  id, slug, title, content, pinned, view_count, reply_count,
  created_at, last_reply_at,
  author:profiles!forum_threads_author_id_fkey ( display_name ),
  category:forum_categories ( slug ),
  last_author:profiles!forum_threads_last_reply_by_fkey ( display_name )
`;

function mapThread(row: RawThreadRow): Thread {
  const authorName = row.author?.display_name ?? "Usuario";
  return {
    slug: row.slug,
    title: row.title,
    author: authorName,
    authorAvatar: initialsFromName(authorName),
    category: row.category?.slug ?? "",
    date: formatLongDate(row.created_at),
    replyCount: row.reply_count,
    viewCount: row.view_count,
    lastReplyDate: row.last_reply_at ? formatRelative(row.last_reply_at) : "",
    lastReplyAuthor: row.last_author?.display_name ?? "",
    pinned: row.pinned,
    content: row.content,
  };
}

export async function getThreadsByCategory(categorySlug: string): Promise<Thread[]> {
  const brand = await getBrandContext();
  if (!brand) return [];

  const supabase = createAdminClient();
  const { data: cat } = await supabase
    .from("forum_categories")
    .select("id")
    .eq("brand_id", brand.id)
    .eq("slug", categorySlug)
    .maybeSingle();
  if (!cat) return [];

  const { data, error } = await supabase
    .from("forum_threads")
    .select(THREAD_SELECT)
    .eq("brand_id", brand.id)
    .eq("category_id", cat.id)
    .is("deleted_at", null)
    .order("pinned", { ascending: false })
    .order("last_reply_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return (data as unknown as RawThreadRow[]).map(mapThread);
}

export async function getRecentThreads(limit = 4): Promise<Thread[]> {
  const brand = await getBrandContext();
  if (!brand) return [];

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("forum_threads")
    .select(THREAD_SELECT)
    .eq("brand_id", brand.id)
    .is("deleted_at", null)
    .order("last_reply_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return (data as unknown as RawThreadRow[]).map(mapThread);
}

export async function getAllThreadsAdmin(): Promise<Thread[]> {
  const scope = await getAdminScope();
  if (scope.kind === "none") return [];
  const supabase = createAdminClient();
  let query = supabase
    .from("forum_threads")
    .select(THREAD_SELECT)
    .is("deleted_at", null)
    .order("last_reply_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });
  if (scope.brand) query = query.eq("brand_id", scope.brand.id);
  const { data, error } = await query;
  if (error || !data) return [];
  return (data as unknown as RawThreadRow[]).map(mapThread);
}

export async function getThreadBySlug(category: string, slug: string): Promise<Thread | null> {
  const brand = await getBrandContext();
  if (!brand) return null;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("forum_threads")
    .select(THREAD_SELECT)
    .eq("brand_id", brand.id)
    .eq("slug", slug)
    .is("deleted_at", null)
    .maybeSingle();

  if (error || !data) return null;
  const row = data as unknown as RawThreadRow;
  if (row.category?.slug !== category) return null;
  return mapThread(row);
}

// ============================================================================
// Forum replies
// ============================================================================

type RawReplyRow = {
  id: string;
  content: string;
  created_at: string;
  author: { id: string; display_name: string | null } | null;
  thread: { author_id: string | null } | null;
};

export async function getRepliesByThread(threadSlug: string): Promise<Reply[]> {
  const brand = await getBrandContext();
  if (!brand) return [];

  const supabase = createAdminClient();
  const { data: thread } = await supabase
    .from("forum_threads")
    .select("id, author_id")
    .eq("brand_id", brand.id)
    .eq("slug", threadSlug)
    .maybeSingle();
  if (!thread) return [];

  const { data, error } = await supabase
    .from("forum_replies")
    .select(
      `id, content, created_at,
       author:profiles!forum_replies_author_id_fkey ( id, display_name )`
    )
    .eq("thread_id", thread.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  if (error || !data) return [];

  return (data as unknown as RawReplyRow[]).map((row) => {
    const name = row.author?.display_name ?? "Usuario";
    return {
      id: row.id,
      author: name,
      avatar: initialsFromName(name),
      date: formatLongDate(row.created_at),
      content: row.content,
      isAuthor: row.author?.id === thread.author_id,
    };
  });
}

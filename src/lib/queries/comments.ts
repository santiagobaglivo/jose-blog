import { getAdminScope } from "@/lib/auth/admin-scope";
import { getBrandContext } from "@/lib/auth/brand-context";
import {
  commentStatusDbToUi,
  formatLongDate,
  initialsFromName,
  type DbCommentStatus,
} from "@/lib/format";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Comment } from "@/types/blog";

type RawCommentRow = {
  id: string;
  content: string;
  status: DbCommentStatus;
  created_at: string;
  author: { id: string; display_name: string | null } | null;
  // email del usuario via join a auth.users vendría aparte (no expuesto vía PostgREST).
  post: { slug: string | null } | null;
};

function mapCommentRow(row: RawCommentRow, emailByUserId: Map<string, string>): Comment {
  const authorName = row.author?.display_name ?? "Usuario";
  return {
    id: row.id,
    author: authorName,
    email: row.author?.id ? emailByUserId.get(row.author.id) ?? "" : "",
    avatar: initialsFromName(authorName),
    content: row.content,
    date: formatLongDate(row.created_at),
    status: commentStatusDbToUi(row.status),
    postSlug: row.post?.slug ?? "",
  };
}

async function buildEmailMap(authorIds: string[]): Promise<Map<string, string>> {
  if (authorIds.length === 0) return new Map();
  const supabase = createAdminClient();
  // listUsers de auth.admin no admite filtro; traemos los recientes y filtramos.
  const { data } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const set = new Set(authorIds);
  const map = new Map<string, string>();
  for (const u of data?.users ?? []) {
    if (set.has(u.id) && u.email) map.set(u.id, u.email);
  }
  return map;
}

export async function getApprovedCommentsByPost(slug: string): Promise<Comment[]> {
  const brand = await getBrandContext();
  if (!brand) return [];

  const supabase = createAdminClient();
  const { data: post } = await supabase
    .from("posts")
    .select("id")
    .eq("brand_id", brand.id)
    .eq("slug", slug)
    .maybeSingle();
  if (!post) return [];

  const { data, error } = await supabase
    .from("comments")
    .select(
      `id, content, status, created_at,
       author:profiles!comments_author_id_fkey ( id, display_name ),
       post:posts ( slug )`
    )
    .eq("post_id", post.id)
    .eq("status", "approved")
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  if (error || !data) return [];
  const ids = (data as unknown as RawCommentRow[])
    .map((c) => c.author?.id)
    .filter((x): x is string => Boolean(x));
  const emailMap = await buildEmailMap(Array.from(new Set(ids)));
  return (data as unknown as RawCommentRow[]).map((row) => mapCommentRow(row, emailMap));
}

export async function getAllCommentsAdmin(): Promise<Comment[]> {
  const scope = await getAdminScope();
  if (scope.kind === "none") return [];
  const supabase = createAdminClient();
  let query = supabase
    .from("comments")
    .select(
      `id, content, status, created_at,
       author:profiles!comments_author_id_fkey ( id, display_name ),
       post:posts ( slug )`
    )
    .is("deleted_at", null)
    .order("created_at", { ascending: false });
  if (scope.brand) query = query.eq("brand_id", scope.brand.id);
  const { data, error } = await query;
  if (error || !data) return [];
  const ids = (data as unknown as RawCommentRow[])
    .map((c) => c.author?.id)
    .filter((x): x is string => Boolean(x));
  const emailMap = await buildEmailMap(Array.from(new Set(ids)));
  return (data as unknown as RawCommentRow[]).map((row) => mapCommentRow(row, emailMap));
}

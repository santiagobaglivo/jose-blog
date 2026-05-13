import { format } from "date-fns";
import { es } from "date-fns/locale";

import { getAdminScope } from "@/lib/auth/admin-scope";
import { createAdminClient } from "@/lib/supabase/admin";
import { ForosPanel } from "./foros-panel";

export default async function ForosAdmin() {
  const scope = await getAdminScope();
  if (scope.kind === "none") return null;
  const supabase = createAdminClient();
  const brandId = scope.brand?.id ?? null;

  const catsQuery = supabase
    .from("forum_categories")
    .select("id, slug, name, description, icon, parent_id")
    .order("display_order");

  const threadsQuery = supabase
    .from("forum_threads")
    .select(
      `id, slug, title, pinned, reply_count, created_at,
       category:forum_categories ( slug ),
       author:profiles!forum_threads_author_id_fkey ( display_name )`
    )
    .is("deleted_at", null)
    .order("last_reply_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(50);

  const [{ data: catsRaw }, { data: threadsRaw }] = await Promise.all([
    brandId ? catsQuery.eq("brand_id", brandId) : catsQuery,
    brandId ? threadsQuery.eq("brand_id", brandId) : threadsQuery,
  ]);

  // Stats por categoría: contar hilos + sumar reply_count.
  const statsByCatId = new Map<string, { threadCount: number; replyCount: number }>();
  if (threadsRaw) {
    for (const t of threadsRaw as Array<{ id: string; category: { slug: string } | null; reply_count: number }>) {
      const cat = (catsRaw ?? []).find((c) => c.slug === t.category?.slug);
      if (!cat) continue;
      const slot = statsByCatId.get(cat.id) ?? { threadCount: 0, replyCount: 0 };
      slot.threadCount += 1;
      slot.replyCount += t.reply_count ?? 0;
      statsByCatId.set(cat.id, slot);
    }
  }

  const cats = (catsRaw ?? []).map((c) => {
    const stats = statsByCatId.get(c.id) ?? { threadCount: 0, replyCount: 0 };
    return {
      id: c.id,
      slug: c.slug,
      parent_id: c.parent_id ?? null,
      name: c.name,
      description: c.description ?? "",
      icon: c.icon ?? "help-circle",
      threadCount: stats.threadCount,
      replyCount: stats.replyCount,
    };
  });

  const threads = (threadsRaw ?? []).map(
    (t: {
      id: string;
      slug: string;
      title: string;
      pinned: boolean;
      reply_count: number;
      created_at: string;
      category: { slug: string } | null;
      author: { display_name: string | null } | null;
    }) => ({
      id: t.id,
      slug: t.slug,
      title: t.title,
      pinned: t.pinned,
      replyCount: t.reply_count,
      author: t.author?.display_name ?? "—",
      category: t.category?.slug ?? "",
      date: format(new Date(t.created_at), "d 'de' MMMM yyyy", { locale: es }),
    })
  );

  return <ForosPanel initialCategories={cats} threads={threads} />;
}

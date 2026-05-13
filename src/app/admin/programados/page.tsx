import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Pencil, CalendarClock, Clock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { postStatusMap } from "@/lib/status";
import { getAdminScope } from "@/lib/auth/admin-scope";
import { createAdminClient } from "@/lib/supabase/admin";
import { PostRowActions } from "../articulos/post-row-actions";

type Row = {
  id: string;
  slug: string;
  title: string;
  status: "draft" | "scheduled" | "published" | "archived";
  scheduled_for: string | null;
  author: { display_name: string | null } | null;
  category: { name: string | null } | null;
};

export default async function ProgramadosPage() {
  const scope = await getAdminScope();
  if (scope.kind === "none") return null;
  const supabase = createAdminClient();
  const brandId = scope.brand?.id ?? null;

  const baseSelect =
    "id, slug, title, status, scheduled_for, author:profiles!posts_author_id_fkey(display_name), category:categories(name)";

  const draftsQuery = supabase
    .from("posts")
    .select(baseSelect)
    .eq("status", "draft")
    .is("deleted_at", null)
    .order("updated_at", { ascending: false });
  const scheduledQuery = supabase
    .from("posts")
    .select(baseSelect)
    .eq("status", "scheduled")
    .is("deleted_at", null)
    .order("scheduled_for", { ascending: true });

  const [{ data: draftsRaw }, { data: scheduledRaw }] = await Promise.all([
    brandId ? draftsQuery.eq("brand_id", brandId) : draftsQuery,
    brandId ? scheduledQuery.eq("brand_id", brandId) : scheduledQuery,
  ]);

  const drafts = (draftsRaw ?? []) as unknown as Row[];
  const scheduled = (scheduledRaw ?? []) as unknown as Row[];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground font-serif tracking-tight">
          Publicaciones programadas
        </h1>
        <p className="mt-1 text-[0.875rem] text-muted-foreground">
          Artículos que se publicarán automáticamente en la fecha indicada
        </p>
      </div>

      {/* Scheduled */}
      <div className="mb-12">
        <h2 className="text-sm font-semibold text-foreground font-sans mb-4 flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-blue-600" />
          Programados ({scheduled.length})
        </h2>
        {scheduled.length > 0 ? (
          <div className="space-y-3">
            {scheduled.map((post) => (
              <div
                key={post.id}
                className="bg-card border border-border/50 rounded-xl p-5 flex items-center gap-4"
              >
                <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                  <CalendarClock className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[0.875rem] font-medium text-foreground truncate">
                    {post.title}
                  </h3>
                  <div className="mt-1 flex items-center gap-3 text-[0.75rem] text-muted-foreground/60">
                    <span>{post.author?.display_name ?? "—"}</span>
                    {post.scheduled_for && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Se publicará el{" "}
                        {format(new Date(post.scheduled_for), "d 'de' MMMM yyyy 'a las' HH:mm", {
                          locale: es,
                        })}
                      </span>
                    )}
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={`text-[0.6875rem] ${postStatusMap.scheduled.className} shrink-0`}
                >
                  {postStatusMap.scheduled.label}
                </Badge>
                <div className="flex items-center gap-1 shrink-0">
                  <Link
                    href={`/admin/articulos/${post.id}`}
                    className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground/60 hover:text-foreground hover:bg-secondary/60 transition-colors"
                    title="Editar"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Link>
                  <PostRowActions postId={post.id} postTitle={post.title} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Sin publicaciones programadas"
            description="No hay artículos programados para publicación futura."
          />
        )}
      </div>

      {/* Drafts */}
      <div>
        <h2 className="text-sm font-semibold text-foreground font-sans mb-4 flex items-center gap-2">
          <Clock className="h-4 w-4 text-gray-500" />
          Borradores ({drafts.length})
        </h2>
        {drafts.length > 0 ? (
          <div className="space-y-3">
            {drafts.map((post) => (
              <div
                key={post.id}
                className="bg-card border border-border/50 rounded-xl p-5 flex items-center gap-4"
              >
                <div className="h-12 w-12 rounded-lg bg-secondary/60 flex items-center justify-center text-muted-foreground/50 shrink-0">
                  <Clock className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[0.875rem] font-medium text-foreground truncate">
                    {post.title}
                  </h3>
                  <div className="mt-1 flex items-center gap-3 text-[0.75rem] text-muted-foreground/60">
                    <span>{post.author?.display_name ?? "—"}</span>
                    <span>{post.category?.name ?? "Sin categoría"}</span>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={`text-[0.6875rem] ${postStatusMap.draft.className} shrink-0`}
                >
                  {postStatusMap.draft.label}
                </Badge>
                <div className="flex items-center gap-1 shrink-0">
                  <Link
                    href={`/admin/articulos/${post.id}`}
                    className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground/60 hover:text-foreground hover:bg-secondary/60 transition-colors"
                    title="Editar"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Link>
                  <PostRowActions postId={post.id} postTitle={post.title} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Sin borradores"
            description="No hay artículos en estado de borrador."
          />
        )}
      </div>
    </div>
  );
}

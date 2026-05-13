import Link from "next/link";
import { Shield } from "lucide-react";

import { getAllCommentsAdmin } from "@/lib/queries/comments";
import { getAllPostsAdmin } from "@/lib/queries/posts";
import { commentStatusMap } from "@/lib/status";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import { SearchBar } from "@/components/shared/search-bar";
import { paginate } from "@/lib/paginate";
import { CommentRowActions } from "./comment-row-actions";

type Filter = "all" | "pending" | "approved" | "rejected";

const FILTERS: { label: string; value: Filter; href: string }[] = [
  { label: "Todos", value: "all", href: "/admin/comentarios" },
  { label: "Pendientes", value: "pending", href: "/admin/comentarios?status=pending" },
  { label: "Aprobados", value: "approved", href: "/admin/comentarios?status=approved" },
  { label: "Rechazados", value: "rejected", href: "/admin/comentarios?status=rejected" },
];

const UI_STATUS_BY_FILTER: Record<Filter, string | null> = {
  all: null,
  pending: "pendiente",
  approved: "aprobado",
  rejected: "rechazado",
};

function parseFilter(value: string | string[] | undefined): Filter {
  if (value === "pending" || value === "approved" || value === "rejected") return value;
  return "all";
}

export default async function ComentariosAdmin({
  searchParams,
}: {
  searchParams: Promise<{ status?: string | string[]; page?: string | string[] }>;
}) {
  const { status, page: pageParam } = await searchParams;
  const activeFilter = parseFilter(status);
  const [allComments, posts] = await Promise.all([getAllCommentsAdmin(), getAllPostsAdmin()]);

  const uiStatus = UI_STATUS_BY_FILTER[activeFilter];
  const filteredComments = uiStatus
    ? allComments.filter((c) => c.status === uiStatus)
    : allComments;
  const { items: comments, total, page, totalPages } = paginate(filteredComments, pageParam, 12);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground font-serif tracking-tight">
            Moderación de comentarios
          </h1>
          <p className="mt-1 text-[0.875rem] text-muted-foreground">
            Aprobar, rechazar o eliminar comentarios del blog
          </p>
        </div>
        <div className="flex items-center gap-2 text-[0.8125rem] text-muted-foreground">
          <Shield className="h-4 w-4" />
          <span>{allComments.length} comentarios en total</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        <SearchBar placeholder="Buscar comentarios..." className="w-full sm:w-72" />
        <div className="flex items-center gap-2">
          {FILTERS.map((filter) => {
            const isActive = filter.value === activeFilter;
            return (
              <Link
                key={filter.value}
                href={filter.href}
                className={`h-8 px-3 inline-flex items-center text-[0.75rem] font-medium rounded-md transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                }`}
              >
                {filter.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Comments list */}
      {comments.length === 0 ? (
        <div className="bg-card border border-border/50 rounded-xl">
          <EmptyState
            title={
              activeFilter === "all" ? "Sin comentarios" : `Sin comentarios ${activeFilter === "pending" ? "pendientes" : activeFilter === "approved" ? "aprobados" : "rechazados"}`
            }
            description="Los comentarios pasan por moderación antes de aparecer en el blog."
          />
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => {
            const status = commentStatusMap[comment.status];
            const post = posts.find((p) => p.slug === comment.postSlug);
            return (
              <div key={comment.id} className="bg-card border border-border/50 rounded-xl p-5">
                <div className="flex items-start gap-4">
                  <div className="shrink-0 h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                    <span className="text-[0.75rem] font-semibold text-muted-foreground">
                      {comment.avatar}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-[0.875rem] font-medium text-foreground">
                        {comment.author}
                      </span>
                      <Badge variant="outline" className={`text-[0.6875rem] ${status.className}`}>
                        {status.label}
                      </Badge>
                      <span className="text-[0.75rem] text-muted-foreground/60">
                        {comment.date}
                      </span>
                    </div>
                    <p className="text-[0.8125rem] text-muted-foreground leading-relaxed mb-2">
                      {comment.content}
                    </p>
                    <p className="text-[0.75rem] text-muted-foreground/50">
                      En:{" "}
                      <span className="text-muted-foreground/70">
                        {post?.title ?? comment.postSlug ?? "—"}
                      </span>
                    </p>
                  </div>
                  <CommentRowActions commentId={comment.id} status={comment.status} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {comments.length > 0 && totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between text-[0.75rem] text-muted-foreground">
          <span>
            Mostrando {(page - 1) * 12 + 1}–{Math.min(page * 12, total)} de {total}
          </span>
          <Pagination current={page} total={totalPages} />
        </div>
      )}
    </div>
  );
}

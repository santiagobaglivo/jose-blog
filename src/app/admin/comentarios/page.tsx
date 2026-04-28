import { getAllCommentsAdmin } from "@/lib/queries/comments";
import { getAllPostsAdmin } from "@/lib/queries/posts";
import { commentStatusMap } from "@/lib/status";
import { Badge } from "@/components/ui/badge";
import { SearchBar } from "@/components/shared/search-bar";
import { Check, X, Trash2, Shield } from "lucide-react";

export default async function ComentariosAdmin() {
  const [comments, posts] = await Promise.all([getAllCommentsAdmin(), getAllPostsAdmin()]);
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
          <span>Filtro anti-spam activo</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        <SearchBar placeholder="Buscar comentarios..." className="w-full sm:w-72" />
        <div className="flex items-center gap-2">
          {["Todos", "Pendientes", "Aprobados", "Rechazados"].map((filter) => (
            <button
              key={filter}
              className={`h-8 px-3 text-[0.75rem] font-medium rounded-md transition-colors ${
                filter === "Todos"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Comments list */}
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
                    <span className="text-[0.75rem] text-muted-foreground/60">{comment.date}</span>
                  </div>
                  <p className="text-[0.8125rem] text-muted-foreground leading-relaxed mb-2">
                    {comment.content}
                  </p>
                  <p className="text-[0.75rem] text-muted-foreground/50">
                    En:{" "}
                    <span className="text-muted-foreground/70">{post?.title ?? "Artículo"}</span>
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {comment.status !== "aprobado" && (
                    <button
                      className="h-8 w-8 flex items-center justify-center rounded-md text-green-600 hover:bg-green-50 transition-colors"
                      title="Aprobar"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  )}
                  {comment.status !== "rechazado" && (
                    <button
                      className="h-8 w-8 flex items-center justify-center rounded-md text-orange-500 hover:bg-orange-50 transition-colors"
                      title="Rechazar"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground/60 hover:text-destructive hover:bg-red-50 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import { posts } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { CalendarClock, Clock, Pencil, Trash2, Eye } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";

export default function ProgramadosPage() {
  const scheduled = posts.filter((p) => p.status === "programado");
  const drafts = posts.filter((p) => p.status === "borrador");

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
                key={post.slug}
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
                    <span>{post.author.name}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Se publicará el {post.scheduledDate}
                    </span>
                  </div>
                </div>
                <Badge variant="outline" className="text-[0.6875rem] bg-blue-50 text-blue-700 border-blue-200 shrink-0">
                  Programado
                </Badge>
                <div className="flex items-center gap-1 shrink-0">
                  <button className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground/60 hover:text-foreground hover:bg-secondary/60 transition-colors">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground/60 hover:text-destructive hover:bg-red-50 transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
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
                key={post.slug}
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
                    <span>{post.author.name}</span>
                    <span>{post.category}</span>
                  </div>
                </div>
                <Badge variant="outline" className="text-[0.6875rem] shrink-0">
                  Borrador
                </Badge>
                <div className="flex items-center gap-1 shrink-0">
                  <button className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground/60 hover:text-foreground hover:bg-secondary/60 transition-colors">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground/60 hover:text-destructive hover:bg-red-50 transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
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

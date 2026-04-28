import { getAllThreadsAdmin, getForumCategories } from "@/lib/queries/forums";
import { Badge } from "@/components/ui/badge";
import { SearchBar } from "@/components/shared/search-bar";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Pin,
  MessageSquare,
  Lock,
} from "lucide-react";

export default async function ForosAdmin() {
  const [forumCategories, threads] = await Promise.all([
    getForumCategories(),
    getAllThreadsAdmin(),
  ]);
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground font-serif tracking-tight">
            Gestión de Foros
          </h1>
          <p className="mt-1 text-[0.875rem] text-muted-foreground">
            Administrar categorías, hilos y respuestas del foro comunitario
          </p>
        </div>
        <button className="inline-flex h-10 px-4 items-center gap-2 bg-primary text-primary-foreground text-[0.8125rem] font-medium rounded-lg hover:bg-primary/90 transition-colors">
          <Plus className="h-4 w-4" />
          Nueva categoría
        </button>
      </div>

      {/* Forum categories */}
      <div className="mb-10">
        <h2 className="text-sm font-semibold text-foreground font-sans mb-4">
          Categorías del foro
        </h2>
        <div className="bg-card border border-border/50 rounded-xl divide-y divide-border/50">
          {forumCategories.map((cat) => (
            <div key={cat.slug} className="px-5 py-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-[0.875rem] font-medium text-foreground">
                  {cat.name}
                </h3>
                <p className="mt-0.5 text-[0.75rem] text-muted-foreground/60">
                  {cat.description}
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-4 text-[0.75rem] text-muted-foreground/60 shrink-0">
                <span>{cat.threadCount} hilos</span>
                <span>{cat.replyCount} respuestas</span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground/60 hover:text-foreground hover:bg-secondary/60 transition-colors" title="Editar">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground/60 hover:text-destructive hover:bg-red-50 transition-colors" title="Eliminar">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent threads */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-foreground font-sans">
            Hilos recientes
          </h2>
          <SearchBar placeholder="Buscar hilos..." className="w-64" />
        </div>
        <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left px-5 py-3 text-[0.75rem] font-semibold text-muted-foreground uppercase tracking-wider">
                  Hilo
                </th>
                <th className="text-left px-5 py-3 text-[0.75rem] font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                  Categoría
                </th>
                <th className="text-left px-5 py-3 text-[0.75rem] font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">
                  Respuestas
                </th>
                <th className="w-24"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {threads.map((thread) => (
                <tr key={thread.slug} className="hover:bg-secondary/20 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      {thread.pinned && <Pin className="h-3.5 w-3.5 text-warm shrink-0" />}
                      <h3 className="text-[0.8125rem] font-medium text-foreground line-clamp-1">
                        {thread.title}
                      </h3>
                    </div>
                    <p className="mt-0.5 text-[0.75rem] text-muted-foreground/60">
                      por {thread.author} · {thread.date}
                    </p>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <Badge variant="secondary" className="text-[0.6875rem]">
                      {thread.category}
                    </Badge>
                  </td>
                  <td className="px-5 py-4 text-[0.8125rem] text-muted-foreground/60 hidden sm:table-cell">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3.5 w-3.5" />
                      {thread.replyCount}
                    </span>
                  </td>
                  <td className="px-3 py-4">
                    <div className="flex items-center gap-1">
                      <button className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground/60 hover:text-foreground hover:bg-secondary/60 transition-colors" title="Fijar">
                        <Pin className="h-3.5 w-3.5" />
                      </button>
                      <button className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground/60 hover:text-foreground hover:bg-secondary/60 transition-colors" title="Bloquear">
                        <Lock className="h-3.5 w-3.5" />
                      </button>
                      <button className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground/60 hover:text-foreground hover:bg-secondary/60 transition-colors" title="Ocultar">
                        <EyeOff className="h-3.5 w-3.5" />
                      </button>
                      <button className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground/60 hover:text-destructive hover:bg-red-50 transition-colors" title="Eliminar">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

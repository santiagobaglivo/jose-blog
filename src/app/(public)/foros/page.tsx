import Link from "next/link";
import { getForumCategories, getRecentThreads } from "@/lib/queries/forums";
import { forumIconMap } from "@/lib/status";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { SearchBar } from "@/components/shared/search-bar";
import { SectionHeader } from "@/components/shared/section-header";
import { Badge } from "@/components/ui/badge";
import {
  HelpCircle,
  MessageSquare,
  Eye,
  Pin,
} from "lucide-react";

export default async function ForosPage() {
  const [forumCategories, recentThreads] = await Promise.all([
    getForumCategories(),
    getRecentThreads(4),
  ]);

  return (
    <>
      <section className="bg-gradient-to-b from-secondary/40 to-transparent pt-10 pb-8">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Breadcrumbs items={[{ label: "Foros" }]} />
          <div className="mt-8 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-warm mb-3 font-sans">
                Comunidad profesional
              </p>
              <h1 className="text-3xl sm:text-4xl font-semibold text-foreground tracking-tight">
                Foros de consulta
              </h1>
              <p className="mt-3 text-[0.9375rem] text-muted-foreground max-w-xl">
                Espacio de intercambio profesional donde colegas y clientes
                comparten consultas, experiencias y soluciones.
              </p>
            </div>
            <SearchBar placeholder="Buscar en los foros..." className="w-full lg:w-72" />
          </div>
        </div>
      </section>

      <section className="py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {/* Categories */}
          <div className="mb-16">
            <h2 className="text-lg font-semibold text-foreground font-sans mb-6">
              Categorías
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {forumCategories.map((cat) => {
                const Icon = forumIconMap[cat.icon] ?? HelpCircle;
                return (
                  <Link
                    key={cat.slug}
                    href={`/foros/${cat.slug}`}
                    className="group bg-card border border-border/50 rounded-xl p-6 hover:border-border hover:shadow-sm transition-all duration-300"
                  >
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-lg bg-secondary/80 flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shrink-0">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-[0.9375rem] font-semibold text-foreground group-hover:text-primary/80 transition-colors font-sans">
                          {cat.name}
                        </h3>
                        <p className="mt-1 text-[0.8125rem] text-muted-foreground line-clamp-2">
                          {cat.description}
                        </p>
                        <div className="mt-3 flex items-center gap-4 text-[0.75rem] text-muted-foreground/60">
                          <span>{cat.threadCount} hilos</span>
                          <span>{cat.replyCount} respuestas</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-border/30 flex items-center gap-2 text-[0.75rem] text-muted-foreground/60">
                      <span>Última actividad: {cat.lastActivity}</span>
                      <span>por {cat.lastAuthor}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Recent threads */}
          <div>
            <h2 className="text-lg font-semibold text-foreground font-sans mb-6">
              Actividad reciente
            </h2>
            <div className="bg-card border border-border/50 rounded-xl divide-y divide-border/50">
              {recentThreads.map((thread) => (
                <Link
                  key={thread.slug}
                  href={`/foros/${thread.category}/${thread.slug}`}
                  className="flex items-center gap-4 p-5 hover:bg-secondary/30 transition-colors group first:rounded-t-xl last:rounded-b-xl"
                >
                  <div className="shrink-0 h-9 w-9 rounded-full bg-secondary flex items-center justify-center">
                    <span className="text-[0.6875rem] font-semibold text-muted-foreground">
                      {thread.authorAvatar}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {thread.pinned && (
                        <Pin className="h-3.5 w-3.5 text-warm shrink-0" />
                      )}
                      <h3 className="text-[0.875rem] font-medium text-foreground group-hover:text-primary/80 transition-colors truncate">
                        {thread.title}
                      </h3>
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-[0.75rem] text-muted-foreground/60">
                      <span>{thread.author}</span>
                      <span>en {thread.category.replace("-", " ")}</span>
                      <span>{thread.date}</span>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-4 text-[0.75rem] text-muted-foreground/60 shrink-0">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3.5 w-3.5" />
                      {thread.replyCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5" />
                      {thread.viewCount}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* New thread CTA */}
          <div className="mt-10 text-center">
            <button className="h-11 px-6 bg-primary text-primary-foreground text-[0.875rem] font-medium rounded-lg hover:bg-primary/90 transition-colors">
              Crear nuevo hilo
            </button>
          </div>
        </div>
      </section>
    </>
  );
}

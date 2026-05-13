import Link from "next/link";
import {
  getForumCategories,
  getForumCategoryBySlug,
  getThreadsByCategory,
} from "@/lib/queries/forums";
import { requireBrandContext } from "@/lib/auth/brand-context";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { SearchBar } from "@/components/shared/search-bar";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/shared/pagination";
import { MessageSquare, Eye, Pin } from "lucide-react";
import { NewThreadButton } from "../new-thread-button";

export default async function ForumCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const brand = await requireBrandContext();
  const allCategories = await getForumCategories();
  const cat = (await getForumCategoryBySlug(category)) ?? allCategories[0];
  const catThreads = await getThreadsByCategory(category);
  const displayThreads = catThreads;

  return (
    <>
      <section className="bg-gradient-to-b from-secondary/40 to-transparent pt-10 pb-8">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Breadcrumbs items={[{ label: "Foros", href: "/foros" }, { label: cat.name }]} />
          <div className="mt-8 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">
                {cat.name}
              </h1>
              <p className="mt-2 text-[0.9375rem] text-muted-foreground max-w-xl">
                {cat.description}
              </p>
              <div className="mt-3 flex items-center gap-4 text-[0.8125rem] text-muted-foreground/70">
                <span>{cat.threadCount} hilos</span>
                <span>{cat.replyCount} respuestas</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <SearchBar placeholder="Buscar en esta categoría..." className="w-64" />
              <NewThreadButton
                brandSlug={brand.slug}
                categories={allCategories.map((c) => ({ slug: c.slug, name: c.name }))}
                defaultCategorySlug={cat.slug}
                label="Nuevo hilo"
                variant="secondary"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 lg:py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {displayThreads.length === 0 && (
            <div className="bg-card border border-dashed border-border/60 rounded-xl px-8 py-12 text-center mb-6">
              <h3 className="text-base font-semibold text-foreground">
                Esta categoría todavía no tiene hilos
              </h3>
              <p className="mt-2 text-[0.875rem] text-muted-foreground">
                Sé el primero en abrir una consulta — la comunidad responde.
              </p>
            </div>
          )}
          <div className="bg-card border border-border/50 rounded-xl divide-y divide-border/50">
            {displayThreads.map((thread) => (
              <Link
                key={thread.slug}
                href={`/foros/${category}/${thread.slug}`}
                className="flex items-center gap-4 p-5 hover:bg-secondary/30 transition-colors group first:rounded-t-xl last:rounded-b-xl"
              >
                <div className="shrink-0 h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                  <span className="text-[0.75rem] font-semibold text-muted-foreground">
                    {thread.authorAvatar}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {thread.pinned && (
                      <Badge variant="secondary" className="text-[0.6875rem] gap-1">
                        <Pin className="h-3 w-3" />
                        Fijado
                      </Badge>
                    )}
                    <h3 className="text-[0.875rem] font-medium text-foreground group-hover:text-primary/80 transition-colors truncate">
                      {thread.title}
                    </h3>
                  </div>
                  <p className="mt-1 text-[0.8125rem] text-muted-foreground line-clamp-1">
                    {thread.content}
                  </p>
                  <div className="mt-2 flex items-center gap-3 text-[0.75rem] text-muted-foreground/60">
                    <span>{thread.author}</span>
                    <span>{thread.date}</span>
                    <span>Última respuesta: {thread.lastReplyDate}</span>
                  </div>
                </div>
                <div className="hidden sm:flex flex-col items-end gap-1 text-[0.75rem] text-muted-foreground/60 shrink-0">
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-3.5 w-3.5" />
                    {thread.replyCount} respuestas
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" />
                    {thread.viewCount} vistas
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-10">
            <Pagination current={1} total={3} />
          </div>
        </div>
      </section>
    </>
  );
}

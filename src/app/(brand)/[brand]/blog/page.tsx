import { getPublishedPosts } from "@/lib/queries/posts";
import { getCategories, getTags } from "@/lib/queries/categories";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { ArticleCard } from "@/components/blog/article-card";
import { SearchBar } from "@/components/shared/search-bar";
import { Pagination } from "@/components/shared/pagination";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const PER_PAGE = 7;

function parseString(value: string | string[] | undefined): string | undefined {
  if (typeof value === "string" && value.trim()) return value.trim();
  return undefined;
}

function parsePage(value: string | string[] | undefined): number {
  const raw = typeof value === "string" ? Number(value) : NaN;
  return Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : 1;
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string | string[];
    q?: string | string[];
    cat?: string | string[];
    tag?: string | string[];
  }>;
}) {
  const sp = await searchParams;
  const page = parsePage(sp.page);
  const q = parseString(sp.q);
  const categorySlug = parseString(sp.cat);
  const tagSlug = parseString(sp.tag);

  const [postsResult, blogCategories, allTags] = await Promise.all([
    getPublishedPosts({ page, q, categorySlug, tagSlug, perPage: PER_PAGE }),
    getCategories(),
    getTags(),
  ]);
  const { items: published, total, perPage } = postsResult;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const recent = published.slice(0, 4);

  const isFiltered = Boolean(q || categorySlug || tagSlug);
  const filterDescription = q
    ? `Resultados para "${q}"`
    : categorySlug
      ? `Categoría: ${blogCategories.find((c) => c.slug === categorySlug)?.name ?? categorySlug}`
      : tagSlug
        ? `Etiqueta: ${allTags.find((t) => t.slug === tagSlug)?.name ?? tagSlug}`
        : null;

  return (
    <>
      <section className="bg-gradient-to-b from-secondary/40 to-transparent pt-10 pb-8">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Breadcrumbs items={[{ label: "Blog" }]} />
          <div className="mt-8 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-warm mb-3 font-sans">
                Blog profesional
              </p>
              <h1 className="text-3xl sm:text-4xl font-semibold text-foreground tracking-tight">
                Artículos y análisis
              </h1>
              <p className="mt-3 text-[0.9375rem] text-muted-foreground max-w-xl">
                Publicaciones redactadas por nuestro equipo de profesionales sobre impuestos,
                contabilidad, empresas y finanzas.
              </p>
              {filterDescription && (
                <p className="mt-3 text-[0.8125rem] font-medium text-primary">
                  {filterDescription} · {total} resultado{total === 1 ? "" : "s"}
                  {" · "}
                  <Link href="/blog" className="underline">
                    Limpiar filtros
                  </Link>
                </p>
              )}
            </div>
            <SearchBar placeholder="Buscar artículos..." className="w-full lg:w-72" />
          </div>
        </div>
      </section>

      <section className="py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Main content */}
            <div className="flex-1 min-w-0">
              {published.length === 0 ? (
                <div className="bg-card border border-dashed border-border/60 rounded-xl px-8 py-16 text-center">
                  <h2 className="text-lg font-semibold text-foreground">
                    {isFiltered ? "Sin resultados" : "Aún no hay artículos publicados"}
                  </h2>
                  <p className="mt-2 text-[0.875rem] text-muted-foreground max-w-md mx-auto">
                    {isFiltered
                      ? "Probá con otros términos o limpiá los filtros."
                      : "Pronto vamos a compartir análisis y notas profesionales en esta sección."}
                  </p>
                </div>
              ) : (
                <>
                  {/* Featured (solo en página 1 sin filtros) */}
                  {!isFiltered && page === 1 && (
                    <div className="mb-10">
                      <ArticleCard post={published[0]} featured />
                    </div>
                  )}

                  {/* Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {(!isFiltered && page === 1 ? published.slice(1) : published).map((post) => (
                      <ArticleCard key={post.slug} post={post} />
                    ))}
                  </div>

                  {/* Pagination */}
                  <div className="mt-12">
                    <Pagination current={page} total={totalPages} />
                  </div>
                </>
              )}
            </div>

            {/* Sidebar */}
            <aside className="lg:w-72 shrink-0 space-y-8">
              {/* Categories */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-4 font-sans">Categorías</h3>
                <ul className="space-y-2">
                  {blogCategories.map((cat) => (
                    <li key={cat.slug}>
                      <Link
                        href={`/blog?cat=${cat.slug}`}
                        className={`flex items-center justify-between py-1.5 text-[0.8125rem] transition-colors ${
                          cat.slug === categorySlug
                            ? "text-foreground font-semibold"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <span>{cat.name}</span>
                        <Badge variant="secondary" className="text-[0.6875rem] font-normal">
                          {cat.count}
                        </Badge>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recent */}
              {recent.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-4 font-sans">
                    Artículos recientes
                  </h3>
                  <ul className="space-y-4">
                    {recent.map((post) => (
                      <li key={post.slug}>
                        <Link href={`/blog/${post.slug}`} className="group block">
                          <h4 className="text-[0.8125rem] font-medium text-foreground group-hover:text-primary/80 transition-colors leading-snug line-clamp-2">
                            {post.title}
                          </h4>
                          <p className="mt-1 text-[0.75rem] text-muted-foreground/70">
                            {post.date}
                          </p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tags */}
              {allTags.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-4 font-sans">
                    Etiquetas populares
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {allTags.slice(0, 12).map((tag) => (
                      <Link key={tag.slug} href={`/blog?tag=${tag.slug}`}>
                        <Badge
                          variant={tag.slug === tagSlug ? "default" : "outline"}
                          className="text-[0.75rem] font-normal cursor-pointer hover:bg-secondary/60 transition-colors"
                        >
                          {tag.name}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}

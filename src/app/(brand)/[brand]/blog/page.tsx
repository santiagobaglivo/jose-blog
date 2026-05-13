import Link from "next/link";

import { getPostsArchive, getPublishedPosts } from "@/lib/queries/posts";
import { getCategories, getTags } from "@/lib/queries/categories";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { ArticleCard } from "@/components/blog/article-card";
import { BlogSidebar } from "@/components/blog/blog-sidebar";
import { SearchBar } from "@/components/shared/search-bar";
import { Pagination } from "@/components/shared/pagination";

const PER_PAGE = 8;

function parseString(value: string | string[] | undefined): string | undefined {
  if (typeof value === "string" && value.trim()) return value.trim();
  return undefined;
}

function parseInt0(value: string | string[] | undefined): number | undefined {
  const raw = typeof value === "string" ? Number(value) : NaN;
  return Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : undefined;
}

function parsePage(value: string | string[] | undefined): number {
  return parseInt0(value) ?? 1;
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string | string[];
    q?: string | string[];
    cat?: string | string[];
    tag?: string | string[];
    year?: string | string[];
    month?: string | string[];
  }>;
}) {
  const sp = await searchParams;
  const page = parsePage(sp.page);
  const q = parseString(sp.q);
  const categorySlug = parseString(sp.cat);
  const tagSlug = parseString(sp.tag);
  const year = parseInt0(sp.year);
  const month = parseInt0(sp.month);

  const [postsResult, blogCategories, allTags, archive] = await Promise.all([
    getPublishedPosts({
      page,
      q,
      categorySlug,
      tagSlug,
      year,
      month,
      perPage: PER_PAGE,
    }),
    getCategories(),
    getTags(),
    getPostsArchive(),
  ]);
  const { items: published, total, perPage } = postsResult;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const recent = published.slice(0, 4);

  const isFiltered = Boolean(q || categorySlug || tagSlug || year);
  let filterDescription: string | null = null;
  if (q) filterDescription = `Resultados para "${q}"`;
  else if (categorySlug)
    filterDescription = `Categoría: ${blogCategories.find((c) => c.slug === categorySlug)?.name ?? categorySlug}`;
  else if (tagSlug)
    filterDescription = `Etiqueta: ${allTags.find((t) => t.slug === tagSlug)?.name ?? tagSlug}`;
  else if (year && month) {
    const monthName = archive.find((a) => a.year === year && a.month === month)?.label ?? `${month}/${year}`;
    filterDescription = `Archivo: ${monthName}`;
  } else if (year) filterDescription = `Archivo: ${year}`;

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
                Publicaciones de carácter técnico-legal redactadas por el equipo profesional.
              </p>
              {filterDescription && (
                <p className="mt-3 text-[0.8125rem] font-medium text-primary">
                  {filterDescription} · {total} resultado{total === 1 ? "" : "s"}{" "}
                  ·{" "}
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

                  {/* Lista */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {(!isFiltered && page === 1 ? published.slice(1) : published).map((post) => (
                      <ArticleCard key={post.slug} post={post} />
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="mt-12">
                      <Pagination current={page} total={totalPages} />
                    </div>
                  )}
                </>
              )}
            </div>

            <BlogSidebar
              categories={blogCategories}
              tags={allTags}
              archive={archive}
              recent={recent}
              activeCategorySlug={categorySlug}
              activeTagSlug={tagSlug}
              activeYear={year}
              activeMonth={month}
            />
          </div>
        </div>
      </section>
    </>
  );
}

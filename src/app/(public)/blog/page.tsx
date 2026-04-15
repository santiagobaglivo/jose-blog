import { posts, blogCategories } from "@/lib/mock-data";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { ArticleCard } from "@/components/blog/article-card";
import { SearchBar } from "@/components/shared/search-bar";
import { Pagination } from "@/components/shared/pagination";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function BlogPage() {
  const published = posts.filter((p) => p.status === "publicado");
  const recent = published.slice(0, 4);

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
                Publicaciones redactadas por nuestro equipo de profesionales
                sobre impuestos, contabilidad, empresas y finanzas.
              </p>
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
              {/* Featured */}
              <div className="mb-10">
                <ArticleCard post={published[0]} featured />
              </div>

              {/* Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {published.slice(1).map((post) => (
                  <ArticleCard key={post.slug} post={post} />
                ))}
              </div>

              {/* Pagination */}
              <div className="mt-12">
                <Pagination current={1} total={3} />
              </div>
            </div>

            {/* Sidebar */}
            <aside className="lg:w-72 shrink-0 space-y-8">
              {/* Categories */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-4 font-sans">
                  Categorías
                </h3>
                <ul className="space-y-2">
                  {blogCategories.map((cat) => (
                    <li key={cat.slug}>
                      <Link
                        href={`/blog?cat=${cat.slug}`}
                        className="flex items-center justify-between py-1.5 text-[0.8125rem] text-muted-foreground hover:text-foreground transition-colors"
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
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-4 font-sans">
                  Artículos recientes
                </h3>
                <ul className="space-y-4">
                  {recent.map((post) => (
                    <li key={post.slug}>
                      <Link
                        href={`/blog/${post.slug}`}
                        className="group block"
                      >
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

              {/* Tags */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-4 font-sans">
                  Etiquetas populares
                </h3>
                <div className="flex flex-wrap gap-2">
                  {["IVA", "Ganancias", "Monotributo", "PyMEs", "AFIP", "Balances", "Facturación"].map(
                    (tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="text-[0.75rem] font-normal cursor-pointer hover:bg-secondary/60 transition-colors"
                      >
                        {tag}
                      </Badge>
                    )
                  )}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}

import Link from "next/link";
import { ChevronRight, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { SearchBar } from "@/components/shared/search-bar";
import type { Category, Post, Tag } from "@/types/blog";

interface ArchiveEntry {
  year: number;
  month: number;
  label: string;
  count: number;
}

/**
 * Sidebar estilo Blogspot para el blog:
 *  - Buscador destacado arriba.
 *  - Categorías con conteo.
 *  - Archivo agrupado por año / mes.
 *  - Tags cloud.
 *  - Posts recientes.
 */
export function BlogSidebar({
  categories,
  tags,
  archive,
  recent,
  activeCategorySlug,
  activeTagSlug,
  activeYear,
  activeMonth,
}: {
  categories: Category[];
  tags: Tag[];
  archive: ArchiveEntry[];
  recent: Post[];
  activeCategorySlug?: string;
  activeTagSlug?: string;
  activeYear?: number;
  activeMonth?: number;
}) {
  // Agrupar archivo por año.
  const archiveByYear = new Map<number, ArchiveEntry[]>();
  for (const entry of archive) {
    const slot = archiveByYear.get(entry.year) ?? [];
    slot.push(entry);
    archiveByYear.set(entry.year, slot);
  }

  return (
    <aside className="lg:w-72 shrink-0 space-y-6">
      {/* Buscador destacado */}
      <div className="rounded-xl border border-border/50 bg-card p-5">
        <p className="text-[0.6875rem] font-semibold uppercase tracking-widest text-muted-foreground/80 mb-3 flex items-center gap-2">
          <Search className="h-3 w-3" />
          Buscar en el blog
        </p>
        <SearchBar placeholder="Palabra clave..." />
      </div>

      {/* Categorías */}
      {categories.length > 0 && (
        <div className="rounded-xl border border-border/50 bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground font-sans mb-3">
            Categorías
          </h3>
          <ul className="space-y-1">
            {categories.map((cat) => {
              const isActive = cat.slug === activeCategorySlug;
              return (
                <li key={cat.slug}>
                  <Link
                    href={`/blog?cat=${cat.slug}`}
                    className={`flex items-center justify-between gap-2 py-1.5 px-2 -mx-2 rounded-md text-[0.8125rem] transition-colors ${
                      isActive
                        ? "bg-primary/10 text-foreground font-semibold"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    }`}
                  >
                    <span className="truncate">{cat.name}</span>
                    <Badge variant="secondary" className="text-[0.6875rem] font-normal shrink-0">
                      {cat.count}
                    </Badge>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Archivo */}
      {archive.length > 0 && (
        <div className="rounded-xl border border-border/50 bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground font-sans mb-3">Archivo</h3>
          <ul className="space-y-3">
            {Array.from(archiveByYear.entries()).map(([year, entries]) => {
              const yearTotal = entries.reduce((acc, e) => acc + e.count, 0);
              const isYearActive = activeYear === year && !activeMonth;
              return (
                <li key={year}>
                  <Link
                    href={`/blog?year=${year}`}
                    className={`flex items-center justify-between gap-2 py-1 text-[0.8125rem] font-medium transition-colors ${
                      isYearActive
                        ? "text-foreground"
                        : "text-foreground hover:text-primary/80"
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <ChevronRight className="h-3 w-3" />
                      {year}
                    </span>
                    <span className="text-[0.6875rem] text-muted-foreground/70">{yearTotal}</span>
                  </Link>
                  <ul className="ml-4 mt-1 space-y-0.5 border-l border-border/40 pl-3">
                    {entries.map((entry) => {
                      const monthName = entry.label.split(" ")[0];
                      const isMonthActive =
                        activeYear === entry.year && activeMonth === entry.month;
                      return (
                        <li key={`${entry.year}-${entry.month}`}>
                          <Link
                            href={`/blog?year=${entry.year}&month=${entry.month}`}
                            className={`flex items-center justify-between gap-2 py-1 text-[0.75rem] transition-colors ${
                              isMonthActive
                                ? "text-foreground font-semibold"
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            <span>{monthName}</span>
                            <span className="text-[0.6875rem] text-muted-foreground/60">
                              {entry.count}
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Posts recientes */}
      {recent.length > 0 && (
        <div className="rounded-xl border border-border/50 bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground font-sans mb-3">
            Artículos recientes
          </h3>
          <ul className="space-y-3">
            {recent.map((post) => (
              <li key={post.slug}>
                <Link href={`/blog/${post.slug}`} className="group block">
                  <h4 className="text-[0.8125rem] font-medium text-foreground group-hover:text-primary/80 transition-colors leading-snug line-clamp-2">
                    {post.title}
                  </h4>
                  <p className="mt-0.5 text-[0.6875rem] text-muted-foreground/70">{post.date}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Tags cloud */}
      {tags.length > 0 && (
        <div className="rounded-xl border border-border/50 bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground font-sans mb-3">Etiquetas</h3>
          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 24).map((tag) => (
              <Link key={tag.slug} href={`/blog?tag=${tag.slug}`}>
                <Badge
                  variant={tag.slug === activeTagSlug ? "default" : "outline"}
                  className="text-[0.6875rem] font-normal cursor-pointer hover:bg-secondary/60 transition-colors"
                >
                  {tag.name}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}

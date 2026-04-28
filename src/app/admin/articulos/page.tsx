import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Plus, Eye, Pencil, FileText } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { SearchBar } from "@/components/shared/search-bar";
import { createClient } from "@/lib/supabase/server";
import { getAllPostsAdmin, type AdminPostStatus } from "@/lib/queries/posts";
import { postStatusMap } from "@/lib/status";
import { PostRowActions } from "./post-row-actions";

const STATUS_FILTERS: { label: string; value: "all" | AdminPostStatus }[] = [
  { label: "Todos", value: "all" },
  { label: "Publicados", value: "published" },
  { label: "Borradores", value: "draft" },
  { label: "Programados", value: "scheduled" },
];

function parseStatus(value: string | string[] | undefined): AdminPostStatus | undefined {
  if (value === "draft" || value === "scheduled" || value === "published" || value === "archived") {
    return value;
  }
  return undefined;
}

function parseString(value: string | string[] | undefined): string | undefined {
  if (typeof value === "string" && value.trim()) return value.trim();
  return undefined;
}

function buildFilterHref(params: { status?: string; category?: string; q?: string }) {
  const search = new URLSearchParams();
  if (params.status && params.status !== "all") search.set("status", params.status);
  if (params.category) search.set("category", params.category);
  if (params.q) search.set("q", params.q);
  const qs = search.toString();
  return qs ? `/admin/articulos?${qs}` : "/admin/articulos";
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return format(new Date(iso), "d 'de' MMMM yyyy", { locale: es });
}

export default async function ArticulosAdmin({
  searchParams,
}: {
  searchParams: Promise<{ status?: string | string[]; category?: string | string[]; q?: string | string[] }>;
}) {
  const { status, category, q } = await searchParams;
  const activeStatus = parseStatus(status);
  const activeCategory = parseString(category);
  const activeQuery = parseString(q);

  const supabase = await createClient();
  const [posts, categoriesResult] = await Promise.all([
    getAllPostsAdmin({
      status: activeStatus,
      category: activeCategory,
      search: activeQuery,
    }),
    supabase.from("categories").select("slug, name").order("display_order", { ascending: true }),
  ]);
  const categories = categoriesResult.data ?? [];

  const hasActiveFilters = Boolean(activeStatus || activeCategory || activeQuery);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground font-serif tracking-tight">
            Artículos
          </h1>
          <p className="mt-1 text-[0.875rem] text-muted-foreground">
            Gestión de publicaciones del blog
          </p>
        </div>
        <Link
          href="/admin/articulos/nuevo"
          className="inline-flex h-10 px-4 items-center gap-2 bg-primary text-primary-foreground text-[0.8125rem] font-medium rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nuevo artículo
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        <form method="get" action="/admin/articulos" className="w-full sm:w-72">
          {activeStatus && <input type="hidden" name="status" value={activeStatus} />}
          {activeCategory && <input type="hidden" name="category" value={activeCategory} />}
          <SearchBar
            placeholder="Buscar artículos..."
            name="q"
            defaultValue={activeQuery}
          />
        </form>
        <div className="flex flex-wrap items-center gap-2">
          {STATUS_FILTERS.map((filter) => {
            const isActive =
              filter.value === "all" ? !activeStatus : filter.value === activeStatus;
            return (
              <Link
                key={filter.value}
                href={buildFilterHref({
                  status: filter.value,
                  category: activeCategory,
                  q: activeQuery,
                })}
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

      {categories.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <Link
            href={buildFilterHref({ status: activeStatus, q: activeQuery })}
            className={`h-7 px-2.5 inline-flex items-center text-[0.75rem] font-medium rounded-md transition-colors ${
              !activeCategory
                ? "bg-secondary text-foreground"
                : "text-muted-foreground/70 hover:text-foreground hover:bg-secondary/60"
            }`}
          >
            Todas las categorías
          </Link>
          {categories.map((cat) => {
            const isActive = cat.slug === activeCategory;
            return (
              <Link
                key={cat.slug}
                href={buildFilterHref({
                  status: activeStatus,
                  category: cat.slug,
                  q: activeQuery,
                })}
                className={`h-7 px-2.5 inline-flex items-center text-[0.75rem] font-medium rounded-md transition-colors ${
                  isActive
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground/70 hover:text-foreground hover:bg-secondary/60"
                }`}
              >
                {cat.name}
              </Link>
            );
          })}
        </div>
      )}

      {/* Table / Empty */}
      {posts.length === 0 ? (
        <div className="bg-card border border-border/50 rounded-xl">
          <EmptyState
            icon={<FileText className="h-6 w-6" />}
            title={hasActiveFilters ? "Sin resultados" : "Aún no hay artículos"}
            description={
              hasActiveFilters
                ? "Probá ajustar los filtros o limpiar la búsqueda."
                : "Creá tu primer artículo desde el botón de arriba."
            }
          />
        </div>
      ) : (
        <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left px-5 py-3 text-[0.75rem] font-semibold text-muted-foreground uppercase tracking-wider">
                    Artículo
                  </th>
                  <th className="text-left px-5 py-3 text-[0.75rem] font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                    Categoría
                  </th>
                  <th className="text-left px-5 py-3 text-[0.75rem] font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                    Autor
                  </th>
                  <th className="text-left px-5 py-3 text-[0.75rem] font-semibold text-muted-foreground uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="text-left px-5 py-3 text-[0.75rem] font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">
                    Fecha
                  </th>
                  <th className="w-32"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {posts.map((post) => {
                  const status = postStatusMap[post.status];
                  const dateValue =
                    post.status === "scheduled"
                      ? post.scheduledFor
                      : post.publishedAt ?? post.updatedAt;
                  const previewHref =
                    post.status === "published"
                      ? `/blog/${post.slug}`
                      : `/blog/${post.slug}?preview=1`;
                  return (
                    <tr key={post.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-5 py-4">
                        <h3 className="text-[0.8125rem] font-medium text-foreground line-clamp-1">
                          {post.title}
                        </h3>
                        <p className="mt-0.5 text-[0.75rem] text-muted-foreground/60 line-clamp-1">
                          {post.excerpt}
                        </p>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell">
                        {post.category ? (
                          <Badge variant="secondary" className="text-[0.6875rem]">
                            {post.category.name}
                          </Badge>
                        ) : (
                          <span className="text-[0.75rem] text-muted-foreground/40">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-[0.8125rem] text-muted-foreground hidden lg:table-cell">
                        {post.author.name}
                      </td>
                      <td className="px-5 py-4">
                        <Badge variant="outline" className={`text-[0.6875rem] ${status.className}`}>
                          {status.label}
                        </Badge>
                      </td>
                      <td className="px-5 py-4 text-[0.8125rem] text-muted-foreground/60 hidden sm:table-cell">
                        {formatDate(dateValue)}
                      </td>
                      <td className="px-3 py-4">
                        <div className="flex items-center gap-1">
                          <Link
                            href={previewHref}
                            target={post.status === "published" ? "_blank" : undefined}
                            rel={post.status === "published" ? "noopener noreferrer" : undefined}
                            className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground/60 hover:text-foreground hover:bg-secondary/60 transition-colors"
                            title={post.status === "published" ? "Ver" : "Vista previa"}
                            aria-label={`Ver ${post.title}`}
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Link>
                          <Link
                            href={`/admin/articulos/${post.id}`}
                            className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground/60 hover:text-foreground hover:bg-secondary/60 transition-colors"
                            title="Editar"
                            aria-label={`Editar ${post.title}`}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Link>
                          <PostRowActions postId={post.id} postTitle={post.title} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

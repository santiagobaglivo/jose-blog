import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Plus, Eye, Pencil, FileText, EyeOff } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import { SearchBar } from "@/components/shared/search-bar";
import { getAdminScope } from "@/lib/auth/admin-scope";
import { paginate } from "@/lib/paginate";
import { getAllBrandPagesAdmin, type BrandPageStatus } from "@/lib/queries/brand-pages";
import { PageRowActions } from "./page-row-actions";

const STATUS_FILTERS: { label: string; value: "all" | BrandPageStatus }[] = [
  { label: "Todas", value: "all" },
  { label: "Publicadas", value: "published" },
  { label: "Borradores", value: "draft" },
  { label: "Archivadas", value: "archived" },
];

const STATUS_LABEL: Record<BrandPageStatus, { label: string; className: string }> = {
  published: { label: "Publicada", className: "bg-green-50 text-green-700 border-green-200" },
  draft: { label: "Borrador", className: "bg-gray-50 text-gray-600 border-gray-200" },
  archived: { label: "Archivada", className: "bg-amber-50 text-amber-700 border-amber-200" },
};

function parseStatus(value: string | string[] | undefined): BrandPageStatus | undefined {
  if (value === "draft" || value === "published" || value === "archived") return value;
  return undefined;
}

function parseString(value: string | string[] | undefined): string | undefined {
  if (typeof value === "string" && value.trim()) return value.trim();
  return undefined;
}

function buildFilterHref(params: { status?: string; q?: string }) {
  const search = new URLSearchParams();
  if (params.status && params.status !== "all") search.set("status", params.status);
  if (params.q) search.set("q", params.q);
  const qs = search.toString();
  return qs ? `/admin/paginas?${qs}` : "/admin/paginas";
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return format(new Date(iso), "d 'de' MMMM yyyy", { locale: es });
}

export default async function PaginasAdmin({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string | string[];
    q?: string | string[];
    page?: string | string[];
  }>;
}) {
  const { status, q, page: pageParam } = await searchParams;
  const activeStatus = parseStatus(status);
  const activeQuery = parseString(q);

  const scope = await getAdminScope();
  const allPages = await getAllBrandPagesAdmin(scope);

  // Filtros en memoria (lista típicamente chica, < 100 páginas por brand).
  const filtered = allPages.filter((p) => {
    if (activeStatus && p.status !== activeStatus) return false;
    if (activeQuery) {
      const needle = activeQuery.toLowerCase();
      const haystack = `${p.title} ${p.slug} ${p.brand.name}`.toLowerCase();
      if (!haystack.includes(needle)) return false;
    }
    return true;
  });

  const { items: pages, total, page, totalPages } = paginate(filtered, pageParam, 15);
  const hasActiveFilters = Boolean(activeStatus || activeQuery);
  const showsMultipleBrands = scope.kind === "super" && !scope.brand;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground font-serif tracking-tight">
            Páginas
          </h1>
          <p className="mt-1 text-[0.875rem] text-muted-foreground">
            Páginas custom de cada marca (aparecen en el menú público).
          </p>
        </div>
        <Link
          href="/admin/paginas/nuevo"
          className="inline-flex h-10 px-4 items-center gap-2 bg-primary text-primary-foreground text-[0.8125rem] font-medium rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nueva página
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        <form method="get" action="/admin/paginas" className="w-full sm:w-72">
          {activeStatus && <input type="hidden" name="status" value={activeStatus} />}
          <SearchBar
            placeholder="Buscar páginas..."
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
                href={buildFilterHref({ status: filter.value, q: activeQuery })}
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

      {/* Table / Empty */}
      {pages.length === 0 ? (
        <div className="bg-card border border-border/50 rounded-xl">
          <EmptyState
            icon={<FileText className="h-6 w-6" />}
            title={hasActiveFilters ? "Sin resultados" : "Aún no hay páginas"}
            description={
              hasActiveFilters
                ? "Probá ajustar los filtros o limpiar la búsqueda."
                : "Creá tu primera página desde el botón de arriba."
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
                    Página
                  </th>
                  {showsMultipleBrands && (
                    <th className="text-left px-5 py-3 text-[0.75rem] font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                      Marca
                    </th>
                  )}
                  <th className="text-left px-5 py-3 text-[0.75rem] font-semibold text-muted-foreground uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="text-left px-5 py-3 text-[0.75rem] font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                    Menú
                  </th>
                  <th className="text-left px-5 py-3 text-[0.75rem] font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">
                    Actualizada
                  </th>
                  <th className="w-32"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {pages.map((p) => {
                  const statusEntry = STATUS_LABEL[p.status];
                  const previewHref = `/p/${p.slug}`;
                  return (
                    <tr key={p.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-5 py-4">
                        <h3 className="text-[0.8125rem] font-medium text-foreground line-clamp-1">
                          {p.title}
                        </h3>
                        <p className="mt-0.5 text-[0.75rem] text-muted-foreground/60 line-clamp-1 font-mono">
                          /{p.slug}
                        </p>
                      </td>
                      {showsMultipleBrands && (
                        <td className="px-5 py-4 hidden md:table-cell">
                          <Badge variant="secondary" className="text-[0.6875rem]">
                            {p.brand.name}
                          </Badge>
                        </td>
                      )}
                      <td className="px-5 py-4">
                        <Badge
                          variant="outline"
                          className={`text-[0.6875rem] ${statusEntry.className}`}
                        >
                          {statusEntry.label}
                        </Badge>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell">
                        {p.show_in_menu ? (
                          <span className="inline-flex items-center gap-1.5 text-[0.75rem] text-foreground">
                            <Eye className="h-3.5 w-3.5 text-green-600" />
                            Orden {p.menu_order}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[0.75rem] text-muted-foreground/60">
                            <EyeOff className="h-3.5 w-3.5" />
                            Oculta
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-[0.8125rem] text-muted-foreground/60 hidden sm:table-cell">
                        {formatDate(p.updated_at)}
                      </td>
                      <td className="px-3 py-4">
                        <div className="flex items-center gap-1">
                          {p.status === "published" && (
                            <Link
                              href={previewHref}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground/60 hover:text-foreground hover:bg-secondary/60 transition-colors"
                              title="Ver"
                              aria-label={`Ver ${p.title}`}
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Link>
                          )}
                          <Link
                            href={`/admin/paginas/${p.id}`}
                            className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground/60 hover:text-foreground hover:bg-secondary/60 transition-colors"
                            title="Editar"
                            aria-label={`Editar ${p.title}`}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Link>
                          <PageRowActions pageId={p.id} pageTitle={p.title} />
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

      {pages.length > 0 && totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between text-[0.75rem] text-muted-foreground">
          <span>
            Mostrando {(page - 1) * 15 + 1}–{Math.min(page * 15, total)} de {total}
          </span>
          <Pagination current={page} total={totalPages} />
        </div>
      )}
    </div>
  );
}

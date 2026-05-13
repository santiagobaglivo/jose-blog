import Link from "next/link";
import { Eye, Pencil, Plus, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { publicBrandUrl } from "@/lib/brand-public-url";
import { getAllBrandsAdmin } from "@/lib/queries/brands";
import { BrandRowActions } from "./brand-row-actions";

function formatDate(iso: string) {
  return format(new Date(iso), "d 'de' MMMM yyyy", { locale: es });
}

export default async function MarcasAdminPage() {
  const brands = await getAllBrandsAdmin();
  // Pre-resolver URLs públicas (siempre apuntan al subdomain, NUNCA al admin host).
  const publicHrefs = await Promise.all(
    brands.map((b) => publicBrandUrl({ slug: b.slug, domain: b.domain }))
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground font-serif tracking-tight">
            Marcas
          </h1>
          <p className="mt-1 text-[0.875rem] text-muted-foreground">
            Marcas del estudio y los servicios que ofrece cada una.
          </p>
        </div>
        <Link
          href="/admin/marcas/nuevo"
          className="inline-flex h-10 px-4 items-center gap-2 bg-primary text-primary-foreground text-[0.8125rem] font-medium rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nueva marca
        </Link>
      </div>

      {brands.length === 0 ? (
        <div className="bg-card border border-border/50 rounded-xl">
          <EmptyState
            icon={<Sparkles className="h-6 w-6" />}
            title="Aún no hay marcas"
            description="Creá la primera marca para que aparezca en el sitio público."
          />
        </div>
      ) : (
        <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left px-5 py-3 text-[0.75rem] font-semibold text-muted-foreground uppercase tracking-wider">
                    Marca
                  </th>
                  <th className="text-left px-5 py-3 text-[0.75rem] font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                    Servicios
                  </th>
                  <th className="text-left px-5 py-3 text-[0.75rem] font-semibold text-muted-foreground uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="text-left px-5 py-3 text-[0.75rem] font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">
                    Última edición
                  </th>
                  <th className="w-32"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {brands.map((brand, idx) => {
                  const publicHref = publicHrefs[idx];
                  return (
                  <tr key={brand.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span
                          aria-hidden="true"
                          className="h-8 w-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: brand.accent_color ?? "#1e3a5f" }}
                        />
                        <div className="min-w-0">
                          <h3 className="text-[0.8125rem] font-medium text-foreground line-clamp-1">
                            {brand.name}
                          </h3>
                          <p className="mt-0.5 text-[0.75rem] text-muted-foreground/60 line-clamp-1">
                            {brand.domain ? brand.domain : (
                              <span className="italic">Sin dominio</span>
                            )}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <Badge variant="secondary" className="text-[0.6875rem]">
                        {brand.service_count}
                      </Badge>
                    </td>
                    <td className="px-5 py-4">
                      <Badge
                        variant="outline"
                        className={`text-[0.6875rem] ${
                          brand.is_active
                            ? "text-emerald-700 border-emerald-200 bg-emerald-50"
                            : "text-muted-foreground"
                        }`}
                      >
                        {brand.is_active ? "Publicada" : "Oculta"}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-[0.8125rem] text-muted-foreground/60 hidden sm:table-cell">
                      {formatDate(brand.updated_at)}
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex items-center gap-1">
                        {publicHref ? (
                          <a
                            href={publicHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground/60 hover:text-foreground hover:bg-secondary/60 transition-colors"
                            title={`Ver ${brand.domain}`}
                            aria-label={`Ver ${brand.name}`}
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </a>
                        ) : (
                          <span
                            className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground/30 cursor-not-allowed"
                            title="Sin dominio asignado"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </span>
                        )}
                        <Link
                          href={`/admin/marcas/${brand.id}`}
                          className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground/60 hover:text-foreground hover:bg-secondary/60 transition-colors"
                          title="Editar"
                          aria-label={`Editar ${brand.name}`}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Link>
                        <BrandRowActions
                          brandId={brand.id}
                          brandName={brand.name}
                          isActive={brand.is_active}
                        />
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

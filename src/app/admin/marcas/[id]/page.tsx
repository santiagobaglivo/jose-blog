import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { getAdminScope } from "@/lib/auth/admin-scope";
import { publicBrandUrl } from "@/lib/brand-public-url";
import { getBrandByIdAdmin } from "@/lib/queries/brands";
import { BrandForm } from "../brand-form";

export default async function EditarMarcaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const scope = await getAdminScope();
  if (scope.kind === "none") notFound();

  // Admin local solo puede editar SU brand. Super-admin gestiona cualquiera.
  if (scope.kind === "local" && scope.brand && scope.brand.id !== id) {
    notFound();
  }

  const brand = await getBrandByIdAdmin(id);
  if (!brand) notFound();

  const publicHref = await publicBrandUrl(brand);

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/marcas"
            className="h-9 w-9 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
            aria-label="Volver"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-foreground font-serif tracking-tight">
              Editar {brand.name}
            </h1>
            <p className="mt-0.5 text-[0.875rem] text-muted-foreground">
              {brand.services.length} servicios cargados.
            </p>
          </div>
        </div>
        {publicHref ? (
          <a
            href={publicHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 h-9 px-3 text-[0.8125rem] font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/60 rounded-lg transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Ver pública
          </a>
        ) : (
          <span
            title="Esta marca todavía no tiene dominio asignado"
            className="inline-flex items-center gap-1.5 h-9 px-3 text-[0.8125rem] font-medium text-muted-foreground/40 rounded-lg cursor-not-allowed"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Sin dominio
          </span>
        )}
      </div>

      <BrandForm mode="edit" initial={brand} />
    </div>
  );
}

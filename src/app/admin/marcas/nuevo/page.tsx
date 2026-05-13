import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { getAdminScope } from "@/lib/auth/admin-scope";
import { BrandForm } from "../brand-form";

export default async function NuevaMarcaPage() {
  const scope = await getAdminScope();
  // Solo super-admin puede crear marcas.
  if (scope.kind !== "super") notFound();
  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/marcas"
          className="h-9 w-9 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
          aria-label="Volver"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-foreground font-serif tracking-tight">
            Nueva marca
          </h1>
          <p className="mt-0.5 text-[0.875rem] text-muted-foreground">
            Creá una marca con su contenido institucional y lista de servicios.
          </p>
        </div>
      </div>

      <BrandForm mode="create" />
    </div>
  );
}

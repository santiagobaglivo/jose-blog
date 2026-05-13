import Link from "next/link";
import { ArrowRight, Shield } from "lucide-react";

import { getActiveBrands } from "@/lib/queries/brands";

export const revalidate = 60;

export default async function RootPage() {
  const brands = await getActiveBrands();

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-6 lg:px-8 py-20 lg:py-28">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-5 font-sans">
          Plataforma multi-marca
        </p>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-foreground font-serif">
          Cada marca tiene su propio dominio
        </h1>
        <p className="mt-5 text-[0.9375rem] text-muted-foreground leading-relaxed max-w-2xl">
          Estás accediendo desde un host que no está asignado a ninguna marca. En producción cada
          marca responde por su dominio propio. En desarrollo podés acceder por path.
        </p>

        <section className="mt-14">
          <h2 className="text-base font-semibold text-foreground mb-5">Marcas disponibles</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {brands.map((b) => (
              <li
                key={b.id}
                className="flex items-center justify-between rounded-lg border border-border/50 bg-card p-4 hover:border-border transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[0.875rem] font-medium text-foreground">{b.name}</p>
                  <p className="text-[0.75rem] text-muted-foreground mt-0.5">
                    {b.domain ? (
                      <>Dominio: {b.domain}</>
                    ) : (
                      <span className="italic">Sin dominio asignado</span>
                    )}
                  </p>
                </div>
                <Link
                  href={`/${b.slug}`}
                  className="inline-flex items-center gap-1 text-[0.8125rem] font-medium text-foreground hover:text-primary transition-colors shrink-0 ml-4"
                >
                  Ver
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-12 rounded-lg border border-border/50 bg-secondary/30 p-5 flex items-start gap-3">
          <Shield className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" aria-hidden="true" />
          <div className="min-w-0">
            <p className="text-[0.8125rem] font-semibold text-foreground">Acceso administrativo</p>
            <p className="text-[0.75rem] text-muted-foreground mt-0.5 leading-relaxed">
              El panel de administración vive en{" "}
              <Link href="/admin" className="underline hover:text-foreground transition-colors">
                /admin
              </Link>{" "}
              y se gestiona desde un dominio neutral.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

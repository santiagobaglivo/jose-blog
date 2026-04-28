import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <section className="flex flex-1 items-center justify-center px-6 py-24 lg:py-32">
      <div className="mx-auto max-w-xl text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-warm">
          Error 404
        </p>
        <h1 className="mt-6 font-serif text-7xl sm:text-8xl lg:text-9xl text-foreground leading-none">
          404
        </h1>
        <h2 className="mt-8 font-serif text-2xl sm:text-3xl text-foreground tracking-tight">
          Página no encontrada
        </h2>
        <p className="mt-5 text-[0.9375rem] leading-relaxed text-muted-foreground">
          La dirección a la que intentó acceder no existe o fue movida. Puede regresar al
          inicio para continuar navegando.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-[0.875rem] font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>
          <Link
            href="/contacto"
            className="inline-flex h-11 items-center justify-center rounded-lg border border-border px-6 text-[0.875rem] font-medium text-foreground transition-colors hover:bg-secondary/60"
          >
            Contactar al Estudio
          </Link>
        </div>
      </div>
    </section>
  );
}

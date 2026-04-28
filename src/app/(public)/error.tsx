"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw } from "lucide-react";

export default function PublicError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="flex flex-1 items-center justify-center px-6 py-24 lg:py-32">
      <div className="mx-auto max-w-xl text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-warm">
          Error inesperado
        </p>
        <h1 className="mt-6 font-serif text-4xl sm:text-5xl lg:text-6xl text-foreground tracking-tight leading-[1.1]">
          No pudimos cargar este contenido
        </h1>
        <p className="mt-6 text-[0.9375rem] leading-relaxed text-muted-foreground">
          Hubo un problema al mostrar la página solicitada. Puede reintentar en unos
          segundos o volver al inicio para continuar navegando el sitio.
        </p>
        {error.digest ? (
          <p className="mt-4 font-mono text-[0.75rem] text-muted-foreground/70">
            Referencia: {error.digest}
          </p>
        ) : null}
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => unstable_retry()}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-[0.875rem] font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <RefreshCw className="h-4 w-4" />
            Reintentar
          </button>
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-lg border border-border px-6 text-[0.875rem] font-medium text-foreground transition-colors hover:bg-secondary/60"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </section>
  );
}

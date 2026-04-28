"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw, AlertTriangle } from "lucide-react";

export default function AdminError({
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
    <div className="flex h-full items-center justify-center p-6">
      <div className="w-full max-w-lg rounded-xl border border-border/50 bg-card p-8 lg:p-10 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <h1 className="mt-6 font-serif text-2xl sm:text-3xl text-foreground tracking-tight">
          Error en el panel
        </h1>
        <p className="mt-4 text-[0.875rem] leading-relaxed text-muted-foreground">
          No fue posible cargar esta sección del panel editorial. Reintente la operación o
          regrese al dashboard principal.
        </p>
        {error.digest ? (
          <p className="mt-4 font-mono text-[0.75rem] text-muted-foreground/70">
            Referencia: {error.digest}
          </p>
        ) : null}
        <div className="mt-8 flex flex-wrap justify-center gap-2.5">
          <button
            type="button"
            onClick={() => unstable_retry()}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-[0.8125rem] font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <RefreshCw className="h-4 w-4" />
            Reintentar
          </button>
          <Link
            href="/admin"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-border px-5 text-[0.8125rem] font-medium text-foreground transition-colors hover:bg-secondary/60"
          >
            Volver al dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

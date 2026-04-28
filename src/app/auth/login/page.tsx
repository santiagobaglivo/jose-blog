import type { Metadata } from "next";
import Link from "next/link";

import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Iniciar sesión | Velázquez & Asociados",
  description: "Acceso al área de miembros y panel editorial.",
};

type SearchParams = Promise<{ redirectedFrom?: string | string[] }>;

function pickRedirect(value: string | string[] | undefined): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return undefined;
  return raw;
}

export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  const { redirectedFrom } = await searchParams;
  const safeRedirect = pickRedirect(redirectedFrom);

  return (
    <div className="w-full max-w-md">
      <div className="flex flex-col items-center text-center mb-8">
        <Link
          href="/"
          aria-label="Volver al inicio"
          className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center transition-transform hover:scale-105"
        >
          <span className="text-primary-foreground font-serif font-bold text-lg">V</span>
        </Link>
        <h1 className="mt-6 font-serif text-3xl text-foreground tracking-tight">Iniciar sesión</h1>
        <p className="mt-2 text-[0.875rem] text-muted-foreground">
          Accedé con tu email y contraseña
        </p>
      </div>

      <div className="bg-card border border-border/50 rounded-2xl p-8 shadow-sm">
        <LoginForm redirectedFrom={safeRedirect} />
      </div>

      <p className="mt-6 text-center text-[0.8125rem] text-muted-foreground">
        ¿No tenés cuenta?{" "}
        <Link
          href="/auth/registro"
          className="text-foreground font-medium hover:underline underline-offset-4"
        >
          Registrate
        </Link>
      </p>
    </div>
  );
}

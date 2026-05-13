import type { Metadata } from "next";
import Link from "next/link";

import { getBrandContext } from "@/lib/auth/brand-context";
import { RegistroForm } from "./registro-form";

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getBrandContext();
  return {
    title: brand ? `Crear cuenta | ${brand.name}` : "Crear cuenta",
    description: "Registrate para acceder al área de miembros.",
  };
}

export default async function RegistroPage() {
  const brand = await getBrandContext();
  const initial = brand?.name?.charAt(0).toUpperCase() ?? "E";

  return (
    <div className="w-full max-w-md">
      <div className="flex flex-col items-center text-center mb-8">
        <Link
          href="/"
          aria-label="Volver al inicio"
          className="h-12 w-12 rounded-xl flex items-center justify-center transition-transform hover:scale-105"
          style={{ backgroundColor: brand?.accentColor ?? "var(--primary)" }}
        >
          <span className="text-white font-serif font-bold text-lg">{initial}</span>
        </Link>
        <h1 className="mt-6 font-serif text-3xl text-foreground tracking-tight">Crear cuenta</h1>
        <p className="mt-2 text-[0.875rem] text-muted-foreground">
          {brand
            ? `Registrate en ${brand.name} para participar en el blog y los foros.`
            : "Completá tus datos para registrarte."}
        </p>
      </div>

      <div className="bg-card border border-border/50 rounded-2xl p-8 shadow-sm">
        <RegistroForm />
      </div>

      <p className="mt-6 text-center text-[0.8125rem] text-muted-foreground">
        ¿Ya tenés cuenta?{" "}
        <Link
          href="/auth/login"
          className="text-foreground font-medium hover:underline underline-offset-4"
        >
          Iniciá sesión
        </Link>
      </p>
    </div>
  );
}

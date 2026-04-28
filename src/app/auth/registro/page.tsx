import type { Metadata } from "next";
import Link from "next/link";

import { RegistroForm } from "./registro-form";

export const metadata: Metadata = {
  title: "Crear cuenta | Velázquez & Asociados",
  description: "Registrate para acceder al área de miembros.",
};

export default function RegistroPage() {
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
        <h1 className="mt-6 font-serif text-3xl text-foreground tracking-tight">Crear cuenta</h1>
        <p className="mt-2 text-[0.875rem] text-muted-foreground">
          Completá tus datos para registrarte
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

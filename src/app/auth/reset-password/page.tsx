import type { Metadata } from "next";
import Link from "next/link";

import { ResetPasswordForm } from "./reset-password-form";

export const metadata: Metadata = {
  title: "Nueva contraseña | Velázquez & Asociados",
  description: "Definí una nueva contraseña para tu cuenta.",
};

export default function ResetPasswordPage() {
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
        <h1 className="mt-6 font-serif text-3xl text-foreground tracking-tight">
          Nueva contraseña
        </h1>
        <p className="mt-2 text-[0.875rem] text-muted-foreground">
          Ingresá tu nueva contraseña para acceder a tu cuenta
        </p>
      </div>

      <div className="bg-card border border-border/50 rounded-2xl p-8 shadow-sm">
        <ResetPasswordForm />
      </div>

      <p className="mt-6 text-center text-[0.8125rem] text-muted-foreground">
        ¿Necesitás un nuevo enlace?{" "}
        <Link
          href="/auth/recuperar"
          className="text-foreground font-medium hover:underline underline-offset-4"
        >
          Solicitalo acá
        </Link>
      </p>
    </div>
  );
}

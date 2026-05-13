"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, AlertCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { loginSchema, type LoginInput } from "@/lib/validators/auth";

type FormValues = LoginInput;

const SIGN_IN_ERROR = "Email o contraseña incorrectos";

export function LoginForm({
  redirectedFrom,
  localAdminEmail,
  brandName,
}: {
  redirectedFrom?: string;
  localAdminEmail?: string | null;
  brandName?: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "admin@demo.com", password: "Admin1234!" },
  });

  const fillDemo = (email: string, password: string) => {
    setValue("email", email);
    setValue("password", password);
    setServerError(null);
  };

  const onSubmit = (values: FormValues) => {
    setServerError(null);
    startTransition(async () => {
      const supabase = createClient();
      // 1. Auth desde el cliente: setea cookies via @supabase/ssr y dispara
      //    onAuthStateChange en UserProvider en el mismo tick.
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });
      if (error || !data.user) {
        setServerError(SIGN_IN_ERROR);
        return;
      }

      // 2. Determinar redirect: si vino con redirectedFrom, lo respetamos;
      //    si no, decidimos por rol del user.
      let target = "/";
      if (redirectedFrom && redirectedFrom.startsWith("/") && !redirectedFrom.startsWith("//")) {
        target = redirectedFrom;
      } else {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .maybeSingle();
        if (profile?.role === "admin" || profile?.role === "superadmin") {
          target = "/admin";
        }
      }

      toast.success("Sesión iniciada");
      router.replace(target);
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {serverError && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-[0.8125rem] text-destructive"
        >
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{serverError}</span>
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="email" className="block text-[0.8125rem] font-medium text-foreground">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          autoFocus
          disabled={isPending}
          aria-invalid={!!errors.email}
          {...register("email")}
          className={cn(
            "w-full h-11 px-4 bg-secondary/30 border border-border/50 rounded-lg text-[0.875rem] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/40 transition-all disabled:opacity-60",
            errors.email &&
              "border-destructive/50 focus:ring-destructive/20 focus:border-destructive/50"
          )}
          placeholder="tu@email.com"
        />
        {errors.email && <p className="text-[0.75rem] text-destructive">{errors.email.message}</p>}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="block text-[0.8125rem] font-medium text-foreground">
            Contraseña
          </label>
          <Link
            href="/auth/recuperar"
            className="text-[0.75rem] text-muted-foreground hover:text-foreground transition-colors"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          disabled={isPending}
          aria-invalid={!!errors.password}
          {...register("password")}
          className={cn(
            "w-full h-11 px-4 bg-secondary/30 border border-border/50 rounded-lg text-[0.875rem] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/40 transition-all disabled:opacity-60",
            errors.password &&
              "border-destructive/50 focus:ring-destructive/20 focus:border-destructive/50"
          )}
          placeholder="••••••••"
        />
        {errors.password && (
          <p className="text-[0.75rem] text-destructive">{errors.password.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground text-[0.875rem] font-medium hover:bg-primary/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Ingresando…
          </>
        ) : (
          "Iniciar sesión"
        )}
      </button>

      <div className="rounded-lg border border-dashed border-border/60 bg-secondary/30 px-4 py-3">
        <p className="text-[0.6875rem] font-semibold uppercase tracking-widest text-muted-foreground/80">
          Cuentas de demo
        </p>
        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => fillDemo("admin@demo.com", "Admin1234!")}
            className="text-left rounded-md border border-border/40 bg-background px-3 py-2 hover:border-border hover:bg-secondary/50 transition-colors"
          >
            <p className="text-[0.75rem] font-semibold text-foreground">Super-admin</p>
            <p className="text-[0.6875rem] text-muted-foreground/80">admin@demo.com</p>
          </button>
          {localAdminEmail && (
            <button
              type="button"
              onClick={() => fillDemo(localAdminEmail, "Demo1234!")}
              className="text-left rounded-md border border-border/40 bg-background px-3 py-2 hover:border-border hover:bg-secondary/50 transition-colors"
            >
              <p className="text-[0.75rem] font-semibold text-foreground">
                Admin {brandName ?? "marca"}
              </p>
              <p className="text-[0.6875rem] text-muted-foreground/80 truncate">
                {localAdminEmail}
              </p>
            </button>
          )}
          <button
            type="button"
            onClick={() => fillDemo("user@demo.com", "Demo1234!")}
            className="text-left rounded-md border border-border/40 bg-background px-3 py-2 hover:border-border hover:bg-secondary/50 transition-colors"
          >
            <p className="text-[0.75rem] font-semibold text-foreground">Usuario</p>
            <p className="text-[0.6875rem] text-muted-foreground/80">user@demo.com</p>
          </button>
        </div>
        <p className="mt-2 text-[0.6875rem] text-muted-foreground/60">
          Clickeá una cuenta para autocompletar y después &ldquo;Iniciar sesión&rdquo;.
        </p>
      </div>
    </form>
  );
}

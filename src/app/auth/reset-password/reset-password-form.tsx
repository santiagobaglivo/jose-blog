"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, AlertCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { updatePasswordSchema, type UpdatePasswordInput } from "@/lib/validators/auth";
import { updatePassword } from "../actions";

type FormValues = UpdatePasswordInput;

export function ResetPasswordForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    // Inicializar el cliente del browser dispara el intercambio PKCE del
    // ?code=… que Supabase agrega al redirigir desde el email de recuperación.
    // detectSessionInUrl está activo por defecto en createBrowserClient.
    const supabase = createClient();
    void supabase.auth.getSession();
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: { password: "", password_confirm: "" },
  });

  const onSubmit = (values: FormValues) => {
    setServerError(null);
    startTransition(async () => {
      const result = await updatePassword(values);
      if (!result.ok) {
        setServerError(result.error);
        return;
      }
      toast.success("Contraseña actualizada");
      router.replace("/");
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
        <label htmlFor="password" className="block text-[0.8125rem] font-medium text-foreground">
          Nueva contraseña
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          autoFocus
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

      <div className="space-y-1.5">
        <label
          htmlFor="password_confirm"
          className="block text-[0.8125rem] font-medium text-foreground"
        >
          Confirmar contraseña
        </label>
        <input
          id="password_confirm"
          type="password"
          autoComplete="new-password"
          disabled={isPending}
          aria-invalid={!!errors.password_confirm}
          {...register("password_confirm")}
          className={cn(
            "w-full h-11 px-4 bg-secondary/30 border border-border/50 rounded-lg text-[0.875rem] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/40 transition-all disabled:opacity-60",
            errors.password_confirm &&
              "border-destructive/50 focus:ring-destructive/20 focus:border-destructive/50"
          )}
          placeholder="••••••••"
        />
        {errors.password_confirm && (
          <p className="text-[0.75rem] text-destructive">{errors.password_confirm.message}</p>
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
            Actualizando…
          </>
        ) : (
          "Actualizar contraseña"
        )}
      </button>
    </form>
  );
}

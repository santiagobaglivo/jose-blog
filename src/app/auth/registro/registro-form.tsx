"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, AlertCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { signUp } from "../actions";

const formSchema = z
  .object({
    display_name: z
      .string()
      .trim()
      .min(2, "El nombre debe tener al menos 2 caracteres")
      .max(80, "El nombre no puede superar 80 caracteres"),
    email: z.string().min(1, "Ingresá tu email").email("Email inválido"),
    password: z
      .string()
      .min(8, "Mínimo 8 caracteres")
      .regex(/[0-9]/, "Debe incluir al menos un número"),
    password_confirm: z.string().min(1, "Confirmá tu contraseña"),
  })
  .refine((data) => data.password === data.password_confirm, {
    path: ["password_confirm"],
    message: "Las contraseñas no coinciden",
  });

type FormValues = z.infer<typeof formSchema>;

export function RegistroForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { display_name: "", email: "", password: "", password_confirm: "" },
  });

  const onSubmit = (values: FormValues) => {
    setServerError(null);
    startTransition(async () => {
      const result = await signUp(values);
      if (!result.ok) {
        setServerError(result.error);
        return;
      }
      toast.success("Te enviamos un email de confirmación");
      router.replace("/auth/login");
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
        <label htmlFor="display_name" className="block text-[0.8125rem] font-medium text-foreground">
          Nombre
        </label>
        <input
          id="display_name"
          type="text"
          autoComplete="name"
          autoFocus
          disabled={isPending}
          aria-invalid={!!errors.display_name}
          {...register("display_name")}
          className={cn(
            "w-full h-11 px-4 bg-secondary/30 border border-border/50 rounded-lg text-[0.875rem] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/40 transition-all disabled:opacity-60",
            errors.display_name &&
              "border-destructive/50 focus:ring-destructive/20 focus:border-destructive/50"
          )}
          placeholder="Tu nombre"
        />
        {errors.display_name && (
          <p className="text-[0.75rem] text-destructive">{errors.display_name.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="email" className="block text-[0.8125rem] font-medium text-foreground">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
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
        <label htmlFor="password" className="block text-[0.8125rem] font-medium text-foreground">
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
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
            Creando cuenta…
          </>
        ) : (
          "Crear cuenta"
        )}
      </button>
    </form>
  );
}

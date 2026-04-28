"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { requestPasswordReset } from "./actions";

const formSchema = z.object({
  email: z.string().min(1, "Ingresá tu email").email("Email inválido"),
});

type FormValues = z.infer<typeof formSchema>;

export function RecuperarForm() {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = (values: FormValues) => {
    setServerError(null);
    startTransition(async () => {
      const result = await requestPasswordReset(values);
      if (!result.ok) {
        setServerError(result.error);
        return;
      }
      setSubmitted(true);
    });
  };

  if (submitted) {
    return (
      <div role="status" className="flex flex-col items-center text-center gap-3 py-2">
        <CheckCircle2 className="h-10 w-10 text-primary" />
        <p className="text-[0.875rem] text-foreground">
          Si tu email está registrado, te enviamos un correo con instrucciones para recuperar tu
          contraseña.
        </p>
        <p className="text-[0.8125rem] text-muted-foreground">
          Revisá tu bandeja de entrada y carpeta de spam.
        </p>
      </div>
    );
  }

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

      <button
        type="submit"
        disabled={isPending}
        className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground text-[0.875rem] font-medium hover:bg-primary/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Enviando…
          </>
        ) : (
          "Enviar instrucciones"
        )}
      </button>
    </form>
  );
}

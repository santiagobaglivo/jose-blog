"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, AlertCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Profile } from "@/lib/auth/UserProvider";
import { updateProfile } from "./actions";

const formSchema = z.object({
  display_name: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(80, "El nombre no puede superar 80 caracteres"),
  bio: z
    .string()
    .trim()
    .max(500, "La descripción no puede superar 500 caracteres")
    .optional()
    .or(z.literal("")),
  avatar_url: z
    .string()
    .trim()
    .url("Debe ser una URL válida")
    .max(500, "La URL no puede superar 500 caracteres")
    .optional()
    .or(z.literal("")),
});

type FormValues = z.infer<typeof formSchema>;

export function PerfilForm({ profile, email }: { profile: Profile; email: string | null }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      display_name: profile.display_name ?? "",
      bio: profile.bio ?? "",
      avatar_url: profile.avatar_url ?? "",
    },
  });

  const onSubmit = (values: FormValues) => {
    setServerError(null);
    startTransition(async () => {
      const result = await updateProfile(values);
      if (!result.ok) {
        setServerError(result.error);
        return;
      }
      toast.success("Perfil actualizado");
      reset(values);
      router.refresh();
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="bg-card border border-border/50 rounded-xl p-8"
    >
      <h2 className="text-lg font-semibold text-foreground font-sans mb-6">Información personal</h2>

      {serverError && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-[0.8125rem] text-destructive mb-5"
        >
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{serverError}</span>
        </div>
      )}

      <div className="space-y-5">
        <div>
          <label
            htmlFor="display_name"
            className="block text-[0.8125rem] font-medium text-foreground mb-1.5"
          >
            Nombre para mostrar
          </label>
          <input
            id="display_name"
            type="text"
            autoComplete="name"
            disabled={isPending}
            aria-invalid={!!errors.display_name}
            {...register("display_name")}
            className={cn(
              "w-full h-10 px-4 bg-secondary/30 border border-border/50 rounded-lg text-[0.8125rem] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/40 transition-all disabled:opacity-60",
              errors.display_name &&
                "border-destructive/50 focus:ring-destructive/20 focus:border-destructive/50"
            )}
            placeholder="Tu nombre"
          />
          {errors.display_name && (
            <p className="mt-1 text-[0.75rem] text-destructive">{errors.display_name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-[0.8125rem] font-medium text-foreground mb-1.5">Email</label>
          <input
            type="email"
            value={email ?? ""}
            disabled
            readOnly
            className="w-full h-10 px-4 bg-secondary/20 border border-border/50 rounded-lg text-[0.8125rem] text-muted-foreground cursor-not-allowed"
          />
          <p className="mt-1 text-[0.75rem] text-muted-foreground">
            El email no se puede modificar desde aquí.
          </p>
        </div>

        <div>
          <label
            htmlFor="avatar_url"
            className="block text-[0.8125rem] font-medium text-foreground mb-1.5"
          >
            URL del avatar
          </label>
          <input
            id="avatar_url"
            type="url"
            autoComplete="off"
            disabled={isPending}
            aria-invalid={!!errors.avatar_url}
            {...register("avatar_url")}
            className={cn(
              "w-full h-10 px-4 bg-secondary/30 border border-border/50 rounded-lg text-[0.8125rem] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/40 transition-all disabled:opacity-60",
              errors.avatar_url &&
                "border-destructive/50 focus:ring-destructive/20 focus:border-destructive/50"
            )}
            placeholder="https://…"
          />
          {errors.avatar_url && (
            <p className="mt-1 text-[0.75rem] text-destructive">{errors.avatar_url.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="bio"
            className="block text-[0.8125rem] font-medium text-foreground mb-1.5"
          >
            Descripción breve
          </label>
          <textarea
            id="bio"
            rows={3}
            disabled={isPending}
            aria-invalid={!!errors.bio}
            {...register("bio")}
            className={cn(
              "w-full px-4 py-3 bg-secondary/30 border border-border/50 rounded-lg text-[0.8125rem] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/40 transition-all resize-none disabled:opacity-60",
              errors.bio &&
                "border-destructive/50 focus:ring-destructive/20 focus:border-destructive/50"
            )}
            placeholder="Contanos brevemente sobre vos"
          />
          {errors.bio && (
            <p className="mt-1 text-[0.75rem] text-destructive">{errors.bio.message}</p>
          )}
        </div>
      </div>

      <div className="mt-6">
        <button
          type="submit"
          disabled={isPending || !isDirty}
          className="h-10 px-5 inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground text-[0.8125rem] font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Guardando…
            </>
          ) : (
            "Guardar cambios"
          )}
        </button>
      </div>
    </form>
  );
}

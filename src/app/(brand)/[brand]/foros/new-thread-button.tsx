"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, AlertCircle, Plus } from "lucide-react";

import { useUser } from "@/lib/auth/UserProvider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createForumThread } from "./actions";

type CategoryOption = { slug: string; name: string };

const formSchema = z.object({
  categorySlug: z.string().min(1, "Elegí una categoría"),
  title: z
    .string()
    .trim()
    .min(5, "El título es muy corto")
    .max(200, "Máximo 200 caracteres"),
  content: z
    .string()
    .trim()
    .min(10, "Contanos un poco más sobre tu consulta")
    .max(10000, "Máximo 10000 caracteres"),
});
type FormValues = z.infer<typeof formSchema>;

export function NewThreadButton({
  brandSlug,
  categories,
  defaultCategorySlug,
  label = "Crear nuevo hilo",
  variant = "primary",
}: {
  brandSlug: string;
  categories: CategoryOption[];
  defaultCategorySlug?: string;
  label?: string;
  variant?: "primary" | "secondary";
}) {
  const router = useRouter();
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      categorySlug: defaultCategorySlug ?? "",
      title: "",
      content: "",
    },
  });

  const onSubmit = (values: FormValues) => {
    setServerError(null);
    startTransition(async () => {
      const result = await createForumThread({ brandSlug, ...values });
      if (!result.ok) {
        setServerError(result.error);
        toast.error(result.error);
        return;
      }
      toast.success("Hilo creado");
      setOpen(false);
      reset();
      router.push(`/${brandSlug}/foros/${result.categorySlug}/${result.threadSlug}`);
      router.refresh();
    });
  };

  const buttonClass =
    variant === "primary"
      ? "h-11 px-6 bg-primary text-primary-foreground text-[0.875rem] font-medium rounded-lg hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
      : "h-10 px-4 bg-primary text-primary-foreground text-[0.8125rem] font-medium rounded-lg hover:bg-primary/90 transition-colors inline-flex items-center gap-2 shrink-0";

  if (!user) {
    return (
      <Link href="/auth/login" className={buttonClass}>
        <Plus className="h-4 w-4" />
        Iniciar sesión para postear
      </Link>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <button type="button" onClick={() => setOpen(true)} className={buttonClass}>
        <Plus className="h-4 w-4" />
        {label}
      </button>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Crear nuevo hilo</DialogTitle>
          <DialogDescription>
            Compartí tu consulta con la comunidad. Las respuestas son moderadas.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4 mt-2">
          {serverError && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-[0.8125rem] text-destructive"
            >
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{serverError}</span>
            </div>
          )}

          <div>
            <label
              htmlFor="categorySlug"
              className="block text-[0.8125rem] font-medium text-foreground mb-1.5"
            >
              Categoría
            </label>
            <select
              id="categorySlug"
              disabled={isPending}
              {...register("categorySlug")}
              className="w-full h-10 px-3 bg-secondary/30 border border-border/50 rounded-lg text-[0.8125rem] text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/40 transition-all appearance-none disabled:opacity-60"
            >
              <option value="">Seleccionar…</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.categorySlug && (
              <p className="mt-1 text-[0.75rem] text-destructive">
                {errors.categorySlug.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="title"
              className="block text-[0.8125rem] font-medium text-foreground mb-1.5"
            >
              Título
            </label>
            <input
              id="title"
              type="text"
              placeholder="Resumen breve de tu consulta"
              disabled={isPending}
              {...register("title")}
              className="w-full h-10 px-3 bg-secondary/30 border border-border/50 rounded-lg text-[0.8125rem] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/40 transition-all disabled:opacity-60"
            />
            {errors.title && (
              <p className="mt-1 text-[0.75rem] text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="content"
              className="block text-[0.8125rem] font-medium text-foreground mb-1.5"
            >
              Contenido
            </label>
            <textarea
              id="content"
              rows={5}
              placeholder="Contanos los detalles de tu consulta…"
              disabled={isPending}
              {...register("content")}
              className="w-full px-3 py-2 bg-secondary/30 border border-border/50 rounded-lg text-[0.8125rem] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/40 transition-all resize-none disabled:opacity-60"
            />
            {errors.content && (
              <p className="mt-1 text-[0.75rem] text-destructive">{errors.content.message}</p>
            )}
          </div>

          <DialogFooter className="pt-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              disabled={isPending}
              className="h-9 px-4 text-[0.8125rem] font-medium border border-border rounded-md hover:bg-secondary/40 transition-colors disabled:opacity-60"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="h-9 px-5 inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground text-[0.8125rem] font-medium rounded-md hover:bg-primary/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Creando…
                </>
              ) : (
                "Crear hilo"
              )}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

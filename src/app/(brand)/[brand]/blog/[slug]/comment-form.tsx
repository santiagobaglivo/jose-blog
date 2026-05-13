"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, AlertCircle, Info } from "lucide-react";

import { useUser } from "@/lib/auth/UserProvider";
import { createComment } from "./actions";

const formSchema = z.object({
  content: z
    .string()
    .trim()
    .min(2, "El comentario es muy corto")
    .max(2000, "Máximo 2000 caracteres"),
});
type FormValues = z.infer<typeof formSchema>;

export function CommentForm({
  brandSlug,
  postSlug,
}: {
  brandSlug: string;
  postSlug: string;
}) {
  const { user } = useUser();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { content: "" },
  });

  if (!user) {
    return (
      <div className="mt-10 p-6 rounded-xl bg-secondary/30 border border-border/50 flex items-start gap-3">
        <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
        <p className="text-[0.8125rem] text-muted-foreground">
          <Link href="/auth/login" className="font-medium text-foreground underline">
            Iniciá sesión
          </Link>{" "}
          para dejar un comentario. Los comentarios pasan por moderación antes de publicarse.
        </p>
      </div>
    );
  }

  const onSubmit = (values: FormValues) => {
    setServerError(null);
    startTransition(async () => {
      const result = await createComment({ brandSlug, postSlug, content: values.content });
      if (!result.ok) {
        setServerError(result.error);
        toast.error(result.error);
        return;
      }
      reset();
      toast.success("Comentario enviado. Va a aparecer cuando un admin lo apruebe.");
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="mt-10 p-6 rounded-xl bg-secondary/30 border border-border/50"
    >
      <h3 className="text-sm font-semibold text-foreground font-sans mb-4">Dejar un comentario</h3>

      {serverError && (
        <div
          role="alert"
          className="mb-4 flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-[0.8125rem] text-destructive"
        >
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{serverError}</span>
        </div>
      )}

      <textarea
        rows={4}
        placeholder="Escriba su comentario..."
        disabled={isPending}
        {...register("content")}
        className="w-full px-4 py-3 bg-white border border-border/50 rounded-lg text-[0.8125rem] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/40 transition-all resize-none disabled:opacity-60"
      />
      {errors.content && (
        <p className="mt-1 text-[0.75rem] text-destructive">{errors.content.message}</p>
      )}

      <div className="mt-4 flex items-center justify-between">
        <p className="text-[0.75rem] text-muted-foreground/60">
          Los comentarios son moderados antes de su publicación.
        </p>
        <button
          type="submit"
          disabled={isPending}
          className="h-9 px-5 inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground text-[0.8125rem] font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Enviando…
            </>
          ) : (
            "Enviar"
          )}
        </button>
      </div>
    </form>
  );
}

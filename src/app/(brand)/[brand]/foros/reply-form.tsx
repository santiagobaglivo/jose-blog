"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, AlertCircle, Info, ImagePlus } from "lucide-react";

import { useUser } from "@/lib/auth/UserProvider";
import { createForumReply, uploadForumAttachment } from "./actions";

const formSchema = z.object({
  content: z
    .string()
    .trim()
    .min(2, "La respuesta es muy corta")
    .max(10000, "Máximo 10000 caracteres"),
});
type FormValues = z.infer<typeof formSchema>;

export function ReplyForm({
  brandSlug,
  categorySlug,
  threadSlug,
}: {
  brandSlug: string;
  categorySlug: string;
  threadSlug: string;
}) {
  const { user } = useUser();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { content: "" },
  });

  const handleAttach = async (file: File) => {
    setUploading(true);
    const fd = new FormData();
    fd.set("file", file);
    const result = await uploadForumAttachment(fd);
    setUploading(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    const current = getValues("content") ?? "";
    const append = `\n<p><img src="${result.url}" alt="" /></p>`;
    setValue("content", `${current}${append}`, { shouldDirty: true });
    toast.success("Imagen adjuntada");
  };

  if (!user) {
    return (
      <div className="mt-8 bg-card border border-border/50 rounded-xl p-6 flex items-start gap-3">
        <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
        <p className="text-[0.8125rem] text-muted-foreground">
          <Link href="/auth/login" className="font-medium text-foreground underline">
            Iniciá sesión
          </Link>{" "}
          para responder en el foro.
        </p>
      </div>
    );
  }

  const onSubmit = (values: FormValues) => {
    setServerError(null);
    startTransition(async () => {
      const result = await createForumReply({
        brandSlug,
        categorySlug,
        threadSlug,
        content: values.content,
      });
      if (!result.ok) {
        setServerError(result.error);
        toast.error(result.error);
        return;
      }
      reset();
      toast.success("Respuesta publicada");
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="mt-8 bg-card border border-border/50 rounded-xl p-6"
    >
      <h3 className="text-sm font-semibold text-foreground font-sans mb-4">
        Responder a este hilo
      </h3>

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
        placeholder="Escriba su respuesta..."
        disabled={isPending}
        {...register("content")}
        className="w-full px-4 py-3 bg-secondary/30 border border-border/50 rounded-lg text-[0.8125rem] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/40 transition-all resize-none disabled:opacity-60"
      />
      {errors.content && (
        <p className="mt-1 text-[0.75rem] text-destructive">{errors.content.message}</p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleAttach(f);
          e.target.value = "";
        }}
        disabled={isPending || uploading}
      />

      <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isPending || uploading}
            className="inline-flex items-center gap-1.5 h-8 px-3 text-[0.75rem] font-medium border border-border rounded-md hover:bg-secondary/40 transition-colors disabled:opacity-60"
          >
            {uploading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <ImagePlus className="h-3 w-3" />
            )}
            Adjuntar imagen
          </button>
          <p className="text-[0.6875rem] text-muted-foreground/60 hidden sm:block">
            Acepta HTML básico (h2/h3, p, ul/ol, blockquote, strong, em, a, img).
          </p>
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="h-9 px-5 inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground text-[0.8125rem] font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Publicando…
            </>
          ) : (
            "Publicar respuesta"
          )}
        </button>
      </div>
    </form>
  );
}

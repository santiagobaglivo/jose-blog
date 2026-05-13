"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft, Loader2, AlertCircle, ImageIcon } from "lucide-react";

import { upsertPost } from "./actions";

type CategoryOption = { id: string; name: string; slug: string };
type TagOption = { id: string; name: string; slug: string };
type BrandOption = { id: string; name: string; slug: string };

export type PostFormDefaults = {
  postId?: string;
  brandId?: string;
  title: string;
  subtitle: string;
  excerpt: string;
  contentHtml: string;
  featuredImage: string;
  categoryId: string;
  tagIds: string[];
  status: "draft" | "scheduled" | "published";
  scheduledFor: string; // ISO o ""
};

const formSchema = z.object({
  brandId: z.string().uuid().optional(),
  title: z
    .string()
    .trim()
    .min(5, "El título es muy corto")
    .max(200, "Máximo 200 caracteres"),
  subtitle: z.string().trim().max(300).optional(),
  excerpt: z
    .string()
    .trim()
    .min(10, "El extracto es muy corto")
    .max(500, "Máximo 500 caracteres"),
  contentHtml: z.string().min(1, "Falta el contenido"),
  featuredImage: z.string().trim().url("URL inválida").optional().or(z.literal("")),
  categoryId: z.string().optional(),
  tagIds: z.array(z.string()),
  status: z.enum(["draft", "scheduled", "published"]),
  scheduledFor: z.string().optional(),
});
type FormValues = z.infer<typeof formSchema>;

export function PostForm({
  defaults,
  categories,
  tags,
  brands,
  brandRequired,
}: {
  defaults: PostFormDefaults;
  categories: CategoryOption[];
  tags: TagOption[];
  brands: BrandOption[]; // si está vacío, no se muestra selector
  brandRequired: boolean; // super sin scope
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>(defaults.tagIds);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      brandId: defaults.brandId,
      title: defaults.title,
      subtitle: defaults.subtitle,
      excerpt: defaults.excerpt,
      contentHtml: defaults.contentHtml,
      featuredImage: defaults.featuredImage,
      categoryId: defaults.categoryId,
      tagIds: defaults.tagIds,
      status: defaults.status,
      scheduledFor: defaults.scheduledFor ? defaults.scheduledFor.slice(0, 16) : "",
    },
  });

  const status = watch("status");
  const featuredImage = watch("featuredImage");

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) => {
      const next = prev.includes(tagId)
        ? prev.filter((t) => t !== tagId)
        : [...prev, tagId];
      setValue("tagIds", next, { shouldDirty: true });
      return next;
    });
  };

  const onSubmit = (values: FormValues) => {
    setServerError(null);
    startTransition(async () => {
      const scheduledIso = values.scheduledFor
        ? new Date(values.scheduledFor).toISOString()
        : "";
      const result = await upsertPost({
        postId: defaults.postId,
        brandId: values.brandId,
        title: values.title,
        subtitle: values.subtitle ?? "",
        excerpt: values.excerpt,
        contentHtml: values.contentHtml,
        featuredImage: values.featuredImage ?? "",
        categoryId: values.categoryId ?? "",
        tagIds: selectedTags,
        status: values.status,
        scheduledFor: scheduledIso,
      });
      if (!result.ok) {
        setServerError(result.error);
        toast.error(result.error);
        return;
      }
      toast.success(defaults.postId ? "Artículo actualizado" : "Artículo creado");
      router.push(`/admin/articulos`);
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/articulos"
            className="h-9 w-9 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-foreground font-serif tracking-tight">
              {defaults.postId ? "Editar artículo" : "Nuevo artículo"}
            </h1>
            <p className="mt-0.5 text-[0.875rem] text-muted-foreground">
              {defaults.postId
                ? "Actualizar publicación del blog"
                : "Crear una nueva publicación para el blog"}
            </p>
          </div>
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="h-9 px-4 inline-flex items-center gap-2 bg-primary text-primary-foreground text-[0.8125rem] font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-70"
        >
          {isPending ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Guardando…
            </>
          ) : defaults.postId ? (
            "Guardar cambios"
          ) : (
            "Crear artículo"
          )}
        </button>
      </div>

      {serverError && (
        <div
          role="alert"
          className="mb-6 flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-[0.8125rem] text-destructive"
        >
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{serverError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor */}
        <div className="lg:col-span-2 space-y-4">
          <input
            type="text"
            placeholder="Título del artículo"
            disabled={isPending}
            {...register("title")}
            className="w-full h-14 px-5 bg-card border border-border/50 rounded-xl text-xl font-semibold text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/40 transition-all font-serif"
          />
          {errors.title && (
            <p className="text-[0.75rem] text-destructive">{errors.title.message}</p>
          )}

          <input
            type="text"
            placeholder="Subtítulo opcional"
            disabled={isPending}
            {...register("subtitle")}
            className="w-full h-11 px-5 bg-card border border-border/50 rounded-xl text-[0.9375rem] text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/40 transition-all"
          />

          <textarea
            rows={2}
            placeholder="Extracto (resumen corto, aparece en las listas y SEO)"
            disabled={isPending}
            {...register("excerpt")}
            className="w-full px-5 py-3 bg-card border border-border/50 rounded-xl text-[0.875rem] text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/40 transition-all resize-none"
          />
          {errors.excerpt && (
            <p className="text-[0.75rem] text-destructive">{errors.excerpt.message}</p>
          )}

          {/* Featured image URL + preview */}
          <div className="bg-card border border-border/50 rounded-xl p-5 space-y-3">
            <label className="block text-[0.8125rem] font-medium text-foreground">
              Imagen destacada (URL)
            </label>
            <input
              type="url"
              placeholder="https://..."
              disabled={isPending}
              {...register("featuredImage")}
              className="w-full h-10 px-4 bg-secondary/30 border border-border/50 rounded-lg text-[0.8125rem] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/40 transition-all"
            />
            {errors.featuredImage && (
              <p className="text-[0.75rem] text-destructive">{errors.featuredImage.message}</p>
            )}
            {featuredImage && (
              <div className="relative aspect-[16/9] rounded-lg overflow-hidden bg-secondary">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={featuredImage}
                  alt="Vista previa de imagen destacada"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            {!featuredImage && (
              <div className="aspect-[16/9] rounded-lg bg-secondary/40 border border-dashed border-border/60 flex items-center justify-center text-muted-foreground/40">
                <ImageIcon className="h-8 w-8" />
              </div>
            )}
          </div>

          {/* Contenido HTML */}
          <div className="bg-card border border-border/50 rounded-xl p-5">
            <label className="block text-[0.8125rem] font-medium text-foreground mb-2">
              Contenido (HTML)
            </label>
            <p className="text-[0.75rem] text-muted-foreground/70 mb-3">
              Tags permitidas: <code>h2</code>, <code>h3</code>, <code>p</code>, <code>ul</code>,{" "}
              <code>li</code>, <code>blockquote</code>, <code>strong</code>, <code>em</code>,{" "}
              <code>a</code>, <code>img</code>, <code>br</code>. Lo demás se sanitiza.
            </p>
            <textarea
              rows={18}
              placeholder="<h2>Subtítulo</h2><p>Contenido…</p>"
              disabled={isPending}
              {...register("contentHtml")}
              className="w-full px-4 py-3 bg-secondary/20 border border-border/50 rounded-lg text-[0.8125rem] font-mono text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/40 transition-all resize-y"
            />
            {errors.contentHtml && (
              <p className="mt-1 text-[0.75rem] text-destructive">{errors.contentHtml.message}</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {brandRequired && brands.length > 0 && (
            <div className="bg-card border border-border/50 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-foreground font-sans mb-3">Marca</h3>
              <select
                disabled={isPending}
                {...register("brandId")}
                className="w-full h-10 px-3 bg-secondary/30 border border-border/50 rounded-lg text-[0.8125rem] text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/40 transition-all"
              >
                <option value="">Seleccionar marca…</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
              {errors.brandId && (
                <p className="mt-1 text-[0.75rem] text-destructive">{errors.brandId.message}</p>
              )}
            </div>
          )}

          {/* Status */}
          <div className="bg-card border border-border/50 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-foreground font-sans mb-4">
              Estado de publicación
            </h3>
            <div className="space-y-3">
              {[
                { value: "draft", label: "Borrador", desc: "No visible al público" },
                { value: "scheduled", label: "Programado", desc: "Se publicará automáticamente" },
                { value: "published", label: "Publicado", desc: "Visible en el blog" },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className="flex items-start gap-3 p-3 rounded-lg border border-border/50 cursor-pointer hover:bg-secondary/30 transition-colors has-[:checked]:border-primary/30 has-[:checked]:bg-primary/[0.03]"
                >
                  <input
                    type="radio"
                    value={opt.value}
                    disabled={isPending}
                    {...register("status")}
                    className="mt-0.5 accent-primary"
                  />
                  <div>
                    <span className="text-[0.8125rem] font-medium text-foreground">
                      {opt.label}
                    </span>
                    <p className="text-[0.75rem] text-muted-foreground/60">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>

            {status === "scheduled" && (
              <div className="mt-4">
                <label className="block text-[0.8125rem] font-medium text-foreground mb-1.5">
                  Fecha y hora de publicación
                </label>
                <input
                  type="datetime-local"
                  disabled={isPending}
                  {...register("scheduledFor")}
                  className="w-full h-10 px-4 bg-secondary/30 border border-border/50 rounded-lg text-[0.8125rem] text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/40 transition-all"
                />
              </div>
            )}
          </div>

          {/* Category */}
          <div className="bg-card border border-border/50 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-foreground font-sans mb-3">Categoría</h3>
            <select
              disabled={isPending}
              {...register("categoryId")}
              className="w-full h-10 px-3 bg-secondary/30 border border-border/50 rounded-lg text-[0.8125rem] text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/40 transition-all"
            >
              <option value="">Sin categoría</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div className="bg-card border border-border/50 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-foreground font-sans mb-3">Etiquetas</h3>
            <div className="flex flex-wrap gap-2">
              {tags.length === 0 && (
                <p className="text-[0.75rem] text-muted-foreground/60">
                  Aún no hay etiquetas en esta marca.
                </p>
              )}
              {tags.map((tag) => {
                const isOn = selectedTags.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    disabled={isPending}
                    onClick={() => toggleTag(tag.id)}
                    className={`h-7 px-2.5 text-[0.75rem] font-medium border rounded-md transition-all ${
                      isOn
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-primary/[0.03]"
                    }`}
                  >
                    {tag.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

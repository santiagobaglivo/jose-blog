"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft, Loader2, AlertCircle, ImageIcon } from "lucide-react";

import { upsertBrandPage } from "./actions";

type BrandOption = { id: string; name: string; slug: string };

export type BrandPageFormDefaults = {
  pageId?: string;
  brandId?: string;
  title: string;
  slug: string;
  subtitle: string;
  contentHtml: string;
  heroImage: string;
  showInMenu: boolean;
  menuOrder: number;
  status: "draft" | "published" | "archived";
  seoTitle: string;
  seoDescription: string;
};

const formSchema = z.object({
  brandId: z.string().uuid().optional(),
  title: z
    .string()
    .trim()
    .min(2, "El título es muy corto")
    .max(200, "Máximo 200 caracteres"),
  slug: z.string().trim().max(80, "Máximo 80 caracteres").optional(),
  subtitle: z.string().trim().max(300).optional(),
  contentHtml: z.string(),
  heroImage: z.string().trim().url("URL inválida").optional().or(z.literal("")),
  showInMenu: z.boolean(),
  menuOrder: z.number().int().min(0).max(9999),
  status: z.enum(["draft", "published", "archived"]),
  seoTitle: z.string().trim().max(200).optional(),
  seoDescription: z.string().trim().max(500).optional(),
});
type FormValues = z.infer<typeof formSchema>;

export function PageForm({
  defaults,
  brands,
  brandRequired,
}: {
  defaults: BrandPageFormDefaults;
  brands: BrandOption[];
  brandRequired: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      brandId: defaults.brandId,
      title: defaults.title,
      slug: defaults.slug,
      subtitle: defaults.subtitle,
      contentHtml: defaults.contentHtml,
      heroImage: defaults.heroImage,
      showInMenu: defaults.showInMenu,
      menuOrder: defaults.menuOrder,
      status: defaults.status,
      seoTitle: defaults.seoTitle,
      seoDescription: defaults.seoDescription,
    },
  });

  const heroImage = watch("heroImage");
  const contentHtml = watch("contentHtml");

  const onSubmit = (values: FormValues) => {
    setServerError(null);
    startTransition(async () => {
      const result = await upsertBrandPage({
        pageId: defaults.pageId,
        brandId: values.brandId,
        title: values.title,
        slug: values.slug ?? "",
        subtitle: values.subtitle ?? "",
        contentHtml: values.contentHtml,
        heroImage: values.heroImage ?? "",
        showInMenu: values.showInMenu,
        menuOrder: values.menuOrder,
        status: values.status,
        seoTitle: values.seoTitle ?? "",
        seoDescription: values.seoDescription ?? "",
      });
      if (!result.ok) {
        setServerError(result.error);
        toast.error(result.error);
        return;
      }
      toast.success(defaults.pageId ? "Página actualizada" : "Página creada");
      router.push(`/admin/paginas`);
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/paginas"
            className="h-9 w-9 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-foreground font-serif tracking-tight">
              {defaults.pageId ? "Editar página" : "Nueva página"}
            </h1>
            <p className="mt-0.5 text-[0.875rem] text-muted-foreground">
              {defaults.pageId
                ? "Actualizar página de la marca"
                : "Crear una nueva página custom para la marca"}
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
          ) : defaults.pageId ? (
            "Guardar cambios"
          ) : (
            "Crear página"
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
            placeholder="Título de la página"
            disabled={isPending}
            {...register("title")}
            className="w-full h-14 px-5 bg-card border border-border/50 rounded-xl text-xl font-semibold text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/40 transition-all font-serif"
          />
          {errors.title && (
            <p className="text-[0.75rem] text-destructive">{errors.title.message}</p>
          )}

          <input
            type="text"
            placeholder="Slug (opcional, se genera desde el título)"
            disabled={isPending}
            {...register("slug")}
            className="w-full h-11 px-5 bg-card border border-border/50 rounded-xl text-[0.8125rem] font-mono text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/40 transition-all"
          />
          {errors.slug && (
            <p className="text-[0.75rem] text-destructive">{errors.slug.message}</p>
          )}

          <input
            type="text"
            placeholder="Subtítulo (opcional)"
            disabled={isPending}
            {...register("subtitle")}
            className="w-full h-11 px-5 bg-card border border-border/50 rounded-xl text-[0.9375rem] text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/40 transition-all"
          />

          {/* Hero image URL + preview */}
          <div className="bg-card border border-border/50 rounded-xl p-5 space-y-3">
            <label className="block text-[0.8125rem] font-medium text-foreground">
              Imagen de portada (URL)
            </label>
            <input
              type="url"
              placeholder="https://..."
              disabled={isPending}
              {...register("heroImage")}
              className="w-full h-10 px-4 bg-secondary/30 border border-border/50 rounded-lg text-[0.8125rem] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/40 transition-all"
            />
            {errors.heroImage && (
              <p className="text-[0.75rem] text-destructive">{errors.heroImage.message}</p>
            )}
            {heroImage ? (
              <div className="relative aspect-[16/9] rounded-lg overflow-hidden bg-secondary">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={heroImage}
                  alt="Vista previa de imagen de portada"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
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
              Tags permitidas: <code>h2</code>, <code>h3</code>, <code>p</code>,{" "}
              <code>ul</code>, <code>li</code>, <code>blockquote</code>, <code>strong</code>,{" "}
              <code>em</code>, <code>a</code>, <code>img</code>, <code>br</code>. Lo demás se
              sanitiza.
            </p>
            <textarea
              rows={18}
              placeholder="<h2>Subtítulo</h2><p>Contenido…</p>"
              disabled={isPending}
              {...register("contentHtml")}
              className="w-full px-4 py-3 bg-secondary/20 border border-border/50 rounded-lg text-[0.8125rem] font-mono text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/40 transition-all resize-y"
            />
            {errors.contentHtml && (
              <p className="mt-1 text-[0.75rem] text-destructive">
                {errors.contentHtml.message}
              </p>
            )}
          </div>

          {/* Preview */}
          <div className="bg-card border border-border/50 rounded-xl p-5">
            <label className="block text-[0.8125rem] font-medium text-foreground mb-3">
              Vista previa
            </label>
            {contentHtml && contentHtml.trim() ? (
              <div
                className="prose-premium max-w-none text-[0.875rem]"
                // Preview cliente: el server sanitiza al guardar, esto es solo UX.
                dangerouslySetInnerHTML={{ __html: contentHtml }}
              />
            ) : (
              <p className="text-[0.75rem] text-muted-foreground/60 italic">
                Escribí algo en el contenido para ver la vista previa.
              </p>
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
                <p className="mt-1 text-[0.75rem] text-destructive">
                  {errors.brandId.message}
                </p>
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
                { value: "published", label: "Publicada", desc: "Visible en el sitio" },
                { value: "archived", label: "Archivada", desc: "Oculta sin borrar" },
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
          </div>

          {/* Menu */}
          <div className="bg-card border border-border/50 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-foreground font-sans">Menú</h3>
            <label className="flex items-start gap-3 p-3 rounded-lg border border-border/50 cursor-pointer hover:bg-secondary/30 transition-colors has-[:checked]:border-primary/30 has-[:checked]:bg-primary/[0.03]">
              <input
                type="checkbox"
                disabled={isPending}
                {...register("showInMenu")}
                className="mt-0.5 accent-primary"
              />
              <div>
                <span className="text-[0.8125rem] font-medium text-foreground">
                  Mostrar en el menú
                </span>
                <p className="text-[0.75rem] text-muted-foreground/60">
                  Aparece como link en el nav del sitio público de la marca.
                </p>
              </div>
            </label>
            <div>
              <label className="block text-[0.75rem] font-medium text-foreground mb-1.5">
                Orden en el menú
              </label>
              <input
                type="number"
                min={0}
                disabled={isPending}
                {...register("menuOrder", { valueAsNumber: true })}
                className="w-full h-10 px-3 bg-secondary/30 border border-border/50 rounded-lg text-[0.8125rem] text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/40 transition-all"
              />
              {errors.menuOrder && (
                <p className="mt-1 text-[0.75rem] text-destructive">
                  {errors.menuOrder.message}
                </p>
              )}
            </div>
          </div>

          {/* SEO */}
          <div className="bg-card border border-border/50 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-foreground font-sans">SEO</h3>
            <div>
              <label className="block text-[0.75rem] font-medium text-foreground mb-1.5">
                Título SEO
              </label>
              <input
                type="text"
                placeholder="Default: título de la página"
                disabled={isPending}
                {...register("seoTitle")}
                className="w-full h-10 px-3 bg-secondary/30 border border-border/50 rounded-lg text-[0.8125rem] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/40 transition-all"
              />
            </div>
            <div>
              <label className="block text-[0.75rem] font-medium text-foreground mb-1.5">
                Descripción SEO
              </label>
              <textarea
                rows={3}
                placeholder="Resumen para Google y redes sociales"
                disabled={isPending}
                {...register("seoDescription")}
                className="w-full px-3 py-2 bg-secondary/30 border border-border/50 rounded-lg text-[0.8125rem] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/40 transition-all resize-none"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

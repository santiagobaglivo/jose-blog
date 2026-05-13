"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { BrandDetail } from "@/lib/queries/brands";
import type { BrandInput } from "@/lib/validators/brand";
import { createBrand, updateBrand } from "./actions";
import { LogoUploader } from "./logo-uploader";
import { ServicesEditor, type ServiceDraft } from "./services-editor";

interface BrandFormProps {
  initial?: BrandDetail;
  mode: "create" | "edit";
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(new RegExp("[\\u0300-\\u036f]", "g"), "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

const inputClass =
  "w-full h-10 px-3 bg-card border border-border/50 rounded-lg text-[0.875rem] text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/40 transition-all";
const textareaClass =
  "w-full px-3 py-2 bg-card border border-border/50 rounded-lg text-[0.875rem] text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/40 transition-all resize-y";
const labelClass = "block text-[0.8125rem] font-medium text-foreground mb-1.5";
const helpClass = "mt-1 text-[0.75rem] text-muted-foreground/70";
const errorClass = "mt-1 text-[0.75rem] text-destructive";

export function BrandForm({ initial, mode }: BrandFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));
  const [domain, setDomain] = useState(initial?.domain ?? "");
  const [tagline, setTagline] = useState(initial?.tagline ?? "");
  const [heroImage, setHeroImage] = useState(initial?.hero_image ?? "");
  const [aboutText, setAboutText] = useState(initial?.about_text ?? "");
  const [asesoriaText, setAsesoriaText] = useState(initial?.asesoria_text ?? "");
  const [accentColor, setAccentColor] = useState(initial?.accent_color ?? "#1e3a5f");
  const [displayOrder, setDisplayOrder] = useState(initial?.display_order ?? 0);
  const [isActive, setIsActive] = useState(initial?.is_active ?? true);
  const [seoTitle, setSeoTitle] = useState(initial?.seo_title ?? "");
  const [seoDescription, setSeoDescription] = useState(initial?.seo_description ?? "");
  const [services, setServices] = useState<ServiceDraft[]>(
    initial?.services.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description ?? "",
      is_active: s.is_active,
    })) ?? []
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleNameChange(value: string) {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const payload: BrandInput = {
      slug: slug.trim(),
      domain: domain.trim().toLowerCase() || undefined,
      name: name.trim(),
      tagline: tagline.trim() || undefined,
      hero_image: heroImage.trim() || undefined,
      about_text: aboutText.trim(),
      asesoria_text: asesoriaText.trim() || undefined,
      accent_color: accentColor.trim() || undefined,
      display_order: Number.isFinite(displayOrder) ? displayOrder : 0,
      is_active: isActive,
      seo_title: seoTitle.trim() || undefined,
      seo_description: seoDescription.trim() || undefined,
      services: services
        .filter((s) => s.name.trim().length > 0)
        .map((s, i) => ({
          id: s.id,
          name: s.name.trim(),
          description: s.description.trim() || undefined,
          display_order: i,
          is_active: s.is_active,
        })),
    };

    startTransition(async () => {
      const result =
        mode === "create"
          ? await createBrand(payload)
          : await updateBrand(initial!.id, payload);

      if (!result.ok) {
        if (result.fieldErrors) setErrors(result.fieldErrors);
        toast.error(result.error);
        return;
      }

      toast.success(mode === "create" ? "Marca creada" : "Cambios guardados");
      if (mode === "create") {
        router.push(`/admin/marcas/${result.id}`);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-card border border-border/50 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Identidad de la marca</h2>

          <div>
            <label className={labelClass} htmlFor="name">Nombre *</label>
            <input
              id="name"
              className={inputClass}
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Ej. Escudo Tributario"
              required
            />
            {errors.name && <p className={errorClass}>{errors.name}</p>}
          </div>

          <div>
            <label className={labelClass} htmlFor="slug">Slug *</label>
            <input
              id="slug"
              className={inputClass}
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setSlugTouched(true);
              }}
              placeholder="escudo-tributario"
              required
            />
            <p className={helpClass}>
              Identificador interno. Path de fallback en development:{" "}
              <code>/{slug || "..."}</code>.
            </p>
            {errors.slug && <p className={errorClass}>{errors.slug}</p>}
          </div>

          <div>
            <label className={labelClass} htmlFor="domain">Dominio público</label>
            <input
              id="domain"
              className={inputClass}
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="escudotributario.pe"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
            />
            <p className={helpClass}>
              Sin <code>http://</code> ni <code>/</code>. Dejá vacío si todavía no se compró.
              Cuando esté seteado, esta marca responde por ese dominio.
            </p>
            {errors.domain && <p className={errorClass}>{errors.domain}</p>}
          </div>

          <div>
            <label className={labelClass} htmlFor="tagline">Tagline</label>
            <input
              id="tagline"
              className={inputClass}
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="Frase corta que resume la propuesta de valor"
            />
            {errors.tagline && <p className={errorClass}>{errors.tagline}</p>}
          </div>

          <div>
            <label className={labelClass}>Imagen / Logo</label>
            <LogoUploader
              brandId={initial?.id}
              currentUrl={heroImage || null}
              onUploaded={(url) => setHeroImage(url)}
            />
            <p className="mt-2 text-[0.75rem] text-muted-foreground/70">
              O pegá una URL externa si la imagen ya está hosteada en otro lado:
            </p>
            <input
              id="hero_image"
              type="url"
              className={`${inputClass} mt-1`}
              value={heroImage}
              onChange={(e) => setHeroImage(e.target.value)}
              placeholder="https://..."
            />
            {errors.hero_image && <p className={errorClass}>{errors.hero_image}</p>}
          </div>
        </div>

        <div className="bg-card border border-border/50 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Contenido institucional</h2>

          <div>
            <label className={labelClass} htmlFor="about_text">Quiénes somos *</label>
            <textarea
              id="about_text"
              className={textareaClass}
              rows={6}
              value={aboutText}
              onChange={(e) => setAboutText(e.target.value)}
              placeholder="Describí la marca, su especialidad y su público."
              required
            />
            <p className={helpClass}>Separá párrafos con doble salto de línea.</p>
            {errors.about_text && <p className={errorClass}>{errors.about_text}</p>}
          </div>

          <div>
            <label className={labelClass} htmlFor="asesoria_text">Cómo trabajamos</label>
            <textarea
              id="asesoria_text"
              className={textareaClass}
              rows={5}
              value={asesoriaText}
              onChange={(e) => setAsesoriaText(e.target.value)}
              placeholder="Cómo encarás la asesoría, qué metodología seguís, qué entregables hay."
            />
            {errors.asesoria_text && <p className={errorClass}>{errors.asesoria_text}</p>}
          </div>
        </div>

        <ServicesEditor services={services} onChange={setServices} />
      </div>

      <div className="space-y-6">
        <div className="bg-card border border-border/50 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Visibilidad</h2>

          <label className="flex items-start gap-3 p-3 rounded-lg border border-border/50 cursor-pointer hover:bg-secondary/30 transition-colors">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="mt-0.5 accent-primary"
            />
            <div>
              <span className="text-[0.8125rem] font-medium text-foreground">Marca activa</span>
              <p className="text-[0.75rem] text-muted-foreground/70">
                Solo las marcas activas aparecen en el sitio público.
              </p>
            </div>
          </label>

          <div>
            <label className={labelClass} htmlFor="display_order">Orden de aparición</label>
            <input
              id="display_order"
              type="number"
              min={0}
              className={inputClass}
              value={displayOrder}
              onChange={(e) => setDisplayOrder(Number(e.target.value) || 0)}
            />
            <p className={helpClass}>Menor = primero. Empieza desde 0.</p>
          </div>
        </div>

        <div className="bg-card border border-border/50 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Apariencia</h2>

          <div>
            <label className={labelClass} htmlFor="accent_color">Color de acento</label>
            <div className="flex items-center gap-2">
              <input
                id="accent_color"
                type="color"
                className="h-10 w-12 rounded-lg border border-border/50 cursor-pointer"
                value={accentColor.match(/^#[0-9a-fA-F]{6}$/) ? accentColor : "#1e3a5f"}
                onChange={(e) => setAccentColor(e.target.value)}
              />
              <input
                className={inputClass}
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                placeholder="#1e3a5f"
              />
            </div>
            {errors.accent_color && <p className={errorClass}>{errors.accent_color}</p>}
          </div>
        </div>

        <div className="bg-card border border-border/50 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">SEO</h2>

          <div>
            <label className={labelClass} htmlFor="seo_title">SEO title</label>
            <input
              id="seo_title"
              className={inputClass}
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              maxLength={160}
              placeholder="Aparece en la pestaña del navegador y resultados de búsqueda"
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="seo_description">Meta descripción</label>
            <textarea
              id="seo_description"
              className={textareaClass}
              rows={3}
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              maxLength={300}
              placeholder="Resumen visible en Google. 150-160 caracteres recomendado."
            />
          </div>
        </div>

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Guardando…
            </>
          ) : mode === "create" ? (
            "Crear marca"
          ) : (
            "Guardar cambios"
          )}
        </Button>
      </div>
    </form>
  );
}

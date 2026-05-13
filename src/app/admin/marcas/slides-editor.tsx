"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowDown,
  ArrowUp,
  ImageIcon,
  Loader2,
  Plus,
  Save,
  Trash2,
  Upload,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import type { BrandSlide } from "@/lib/queries/brands";

import {
  deleteBrandSlide,
  reorderBrandSlides,
  upsertBrandSlide,
} from "./actions";

/**
 * Estado local de un slide en el editor.
 * - `id` ausente => slide nuevo (todavía no persistido).
 * - `dirty`      => hay cambios sin guardar respecto al último servidor.
 * - `pendingFile` => archivo seleccionado pendiente de subida (al guardar).
 */
interface SlideDraft {
  /** id local estable (uuid no-DB) para keys de React mientras no haya id real. */
  uid: string;
  id?: string;
  title: string;
  subtitle: string;
  image_url: string | null;
  cta_label: string;
  cta_href: string;
  is_active: boolean;
  pendingFile: File | null;
  /** preview local (object URL) cuando hay pendingFile. */
  previewUrl: string | null;
  dirty: boolean;
}

interface SlidesEditorProps {
  brandId?: string;
  initialSlides: BrandSlide[];
}

const inputClass =
  "w-full h-10 px-3 bg-card border border-border/50 rounded-lg text-[0.875rem] text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/40 transition-all";
const textareaClass =
  "w-full px-3 py-2 bg-card border border-border/50 rounded-lg text-[0.875rem] text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/40 transition-all resize-y";
const labelClass = "block text-[0.75rem] font-medium text-foreground mb-1";

let counter = 0;
function makeUid() {
  counter += 1;
  return `draft-${Date.now()}-${counter}`;
}

function toDraft(slide: BrandSlide): SlideDraft {
  return {
    uid: slide.id,
    id: slide.id,
    title: slide.title,
    subtitle: slide.subtitle ?? "",
    image_url: slide.image_url,
    cta_label: slide.cta_label ?? "",
    cta_href: slide.cta_href ?? "",
    is_active: slide.is_active,
    pendingFile: null,
    previewUrl: null,
    dirty: false,
  };
}

function emptyDraft(): SlideDraft {
  return {
    uid: makeUid(),
    title: "",
    subtitle: "",
    image_url: null,
    cta_label: "",
    cta_href: "",
    is_active: true,
    pendingFile: null,
    previewUrl: null,
    dirty: true,
  };
}

export function SlidesEditor({ brandId, initialSlides }: SlidesEditorProps) {
  const router = useRouter();
  const [slides, setSlides] = useState<SlideDraft[]>(initialSlides.map(toDraft));
  const [pendingUid, setPendingUid] = useState<string | null>(null);
  const [reordering, startReorderTransition] = useTransition();

  const disabled = !brandId;

  function updateDraft(uid: string, patch: Partial<SlideDraft>) {
    setSlides((prev) =>
      prev.map((s) => (s.uid === uid ? { ...s, ...patch, dirty: true } : s))
    );
  }

  function addSlide() {
    setSlides((prev) => [...prev, emptyDraft()]);
  }

  function move(uid: string, dir: -1 | 1) {
    let nextOrder: SlideDraft[] | null = null;
    setSlides((prev) => {
      const idx = prev.findIndex((s) => s.uid === uid);
      if (idx < 0) return prev;
      const target = idx + dir;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[target]] = [next[target], next[idx]];
      nextOrder = next;
      return next;
    });

    if (!brandId || !nextOrder) return;
    // Persistir reorder solo si todos los slides ya tienen id real.
    const ids: string[] = [];
    for (const s of nextOrder as SlideDraft[]) {
      if (!s.id) return;
      ids.push(s.id);
    }
    if (ids.length === 0) return;
    startReorderTransition(async () => {
      const res = await reorderBrandSlides(brandId, ids);
      if (!res.ok) toast.error(res.error);
      else router.refresh();
    });
  }

  async function handleSave(uid: string) {
    if (!brandId) {
      toast.error("Guardá la marca antes de cargar slides.");
      return;
    }
    const draft = slides.find((s) => s.uid === uid);
    if (!draft) return;

    if (draft.title.trim().length < 2) {
      toast.error("El título es obligatorio (mínimo 2 caracteres).");
      return;
    }

    const fd = new FormData();
    if (draft.id) fd.append("id", draft.id);
    fd.append("brand_id", brandId);
    fd.append("title", draft.title.trim());
    fd.append("subtitle", draft.subtitle.trim());
    fd.append("image_url", draft.image_url ?? "");
    fd.append("cta_label", draft.cta_label.trim());
    fd.append("cta_href", draft.cta_href.trim());
    fd.append("display_order", String(slides.findIndex((s) => s.uid === uid)));
    fd.append("is_active", draft.is_active ? "true" : "false");
    if (draft.pendingFile) fd.append("file", draft.pendingFile);

    setPendingUid(uid);
    const result = await upsertBrandSlide(fd);
    setPendingUid(null);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Slide guardado");
    if (draft.previewUrl) URL.revokeObjectURL(draft.previewUrl);
    setSlides((prev) =>
      prev.map((s) =>
        s.uid === uid
          ? {
              ...s,
              id: result.id,
              uid: result.id,
              image_url: result.image_url,
              pendingFile: null,
              previewUrl: null,
              dirty: false,
            }
          : s
      )
    );
    router.refresh();
  }

  async function handleDelete(uid: string) {
    const draft = slides.find((s) => s.uid === uid);
    if (!draft) return;

    if (!draft.id) {
      // No persistido, lo sacamos local.
      if (draft.previewUrl) URL.revokeObjectURL(draft.previewUrl);
      setSlides((prev) => prev.filter((s) => s.uid !== uid));
      return;
    }

    const confirmed = window.confirm("¿Eliminar este slide? No se puede deshacer.");
    if (!confirmed) return;

    setPendingUid(uid);
    const result = await deleteBrandSlide(draft.id);
    setPendingUid(null);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Slide eliminado");
    if (draft.previewUrl) URL.revokeObjectURL(draft.previewUrl);
    setSlides((prev) => prev.filter((s) => s.uid !== uid));
    router.refresh();
  }

  return (
    <div className="bg-card border border-border/50 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">
            Slider de portada{" "}
            <span className="text-muted-foreground/60 font-normal">
              ({slides.length})
            </span>
          </h2>
          <p className="mt-0.5 text-[0.75rem] text-muted-foreground/70">
            Carrusel de la home pública. Si no hay slides activos, se muestra el hero
            estándar.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addSlide}
          disabled={disabled}
          className="gap-1.5"
        >
          <Plus className="h-3.5 w-3.5" />
          Agregar slide
        </Button>
      </div>

      {disabled && (
        <p className="text-[0.75rem] text-muted-foreground/70 border border-dashed border-border/50 rounded-lg p-3">
          Guardá la marca primero para habilitar el editor de slides.
        </p>
      )}

      {slides.length === 0 ? (
        <p className="text-[0.8125rem] text-muted-foreground py-4 text-center border border-dashed border-border/50 rounded-lg">
          Aún no hay slides. Agregá el primero con el botón de arriba.
        </p>
      ) : (
        <ul className="space-y-3">
          {slides.map((slide, idx) => (
            <SlideRow
              key={slide.uid}
              slide={slide}
              index={idx}
              total={slides.length}
              pending={pendingUid === slide.uid}
              reordering={reordering}
              onChange={(patch) => updateDraft(slide.uid, patch)}
              onSave={() => handleSave(slide.uid)}
              onDelete={() => handleDelete(slide.uid)}
              onMove={(dir) => move(slide.uid, dir)}
              disabled={disabled}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

interface SlideRowProps {
  slide: SlideDraft;
  index: number;
  total: number;
  pending: boolean;
  reordering: boolean;
  disabled: boolean;
  onChange: (patch: Partial<SlideDraft>) => void;
  onSave: () => void;
  onDelete: () => void;
  onMove: (dir: -1 | 1) => void;
}

function SlideRow({
  slide,
  index,
  total,
  pending,
  reordering,
  disabled,
  onChange,
  onSave,
  onDelete,
  onMove,
}: SlideRowProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const previewSrc = slide.previewUrl ?? slide.image_url ?? null;

  function handleFile(file: File | undefined) {
    if (!file) return;
    if (slide.previewUrl) URL.revokeObjectURL(slide.previewUrl);
    const url = URL.createObjectURL(file);
    onChange({ pendingFile: file, previewUrl: url });
  }

  return (
    <li className="border border-border/50 rounded-lg p-3 bg-secondary/20">
      <div className="flex items-start gap-3">
        <div className="flex flex-col gap-1 pt-1">
          <button
            type="button"
            onClick={() => onMove(-1)}
            disabled={index === 0 || disabled || reordering}
            className="h-6 w-6 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Subir"
          >
            <ArrowUp className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={() => onMove(1)}
            disabled={index === total - 1 || disabled || reordering}
            className="h-6 w-6 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Bajar"
          >
            <ArrowDown className="h-3 w-3" />
          </button>
        </div>

        <div className="flex-1 space-y-3 min-w-0">
          <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-3">
            <div className="space-y-2">
              <div className="aspect-[16/9] rounded-md overflow-hidden bg-secondary/40 border border-border/50 relative">
                {previewSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewSrc}
                    alt={slide.title || "Slide"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/40 gap-1">
                    <ImageIcon className="h-6 w-6" />
                    <span className="text-[0.7rem]">Sin imagen</span>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                className="sr-only"
                onChange={(e) => {
                  handleFile(e.target.files?.[0]);
                  e.target.value = "";
                }}
                disabled={disabled || pending}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || pending}
                className="w-full inline-flex items-center justify-center gap-1.5 h-8 px-2 text-[0.75rem] font-medium border border-border rounded-md hover:bg-secondary/60 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Upload className="h-3 w-3" />
                {previewSrc ? "Reemplazar" : "Subir imagen"}
              </button>
              <input
                type="url"
                value={slide.image_url ?? ""}
                onChange={(e) =>
                  onChange({ image_url: e.target.value || null, pendingFile: null })
                }
                placeholder="O URL externa..."
                className="w-full h-8 px-2 bg-card border border-border/50 rounded-md text-[0.75rem]"
                disabled={disabled}
              />
            </div>

            <div className="space-y-2 min-w-0">
              <div>
                <label className={labelClass} htmlFor={`slide-title-${slide.uid}`}>
                  Título *
                </label>
                <input
                  id={`slide-title-${slide.uid}`}
                  className={inputClass}
                  value={slide.title}
                  onChange={(e) => onChange({ title: e.target.value })}
                  placeholder="Título del slide"
                  maxLength={200}
                  disabled={disabled}
                />
              </div>

              <div>
                <label className={labelClass} htmlFor={`slide-subtitle-${slide.uid}`}>
                  Subtítulo
                </label>
                <textarea
                  id={`slide-subtitle-${slide.uid}`}
                  className={textareaClass}
                  rows={2}
                  value={slide.subtitle}
                  onChange={(e) => onChange({ subtitle: e.target.value })}
                  placeholder="Texto secundario (opcional)"
                  maxLength={400}
                  disabled={disabled}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className={labelClass} htmlFor={`slide-cta-label-${slide.uid}`}>
                    Texto del botón
                  </label>
                  <input
                    id={`slide-cta-label-${slide.uid}`}
                    className={inputClass}
                    value={slide.cta_label}
                    onChange={(e) => onChange({ cta_label: e.target.value })}
                    placeholder="Ej. Consultar"
                    maxLength={80}
                    disabled={disabled}
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor={`slide-cta-href-${slide.uid}`}>
                    Link del botón
                  </label>
                  <input
                    id={`slide-cta-href-${slide.uid}`}
                    className={inputClass}
                    value={slide.cta_href}
                    onChange={(e) => onChange({ cta_href: e.target.value })}
                    placeholder="/contacto o https://..."
                    maxLength={500}
                    disabled={disabled}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="inline-flex items-center gap-2 text-[0.75rem] text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={slide.is_active}
                    onChange={(e) => onChange({ is_active: e.target.checked })}
                    disabled={disabled}
                  />
                  Activo
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onDelete}
                    disabled={disabled || pending}
                    className="h-8 px-2 inline-flex items-center gap-1 text-[0.75rem] text-muted-foreground hover:text-destructive hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                    aria-label="Eliminar slide"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Eliminar
                  </button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={onSave}
                    disabled={disabled || pending || !slide.dirty}
                    className="gap-1.5 h-8"
                  >
                    {pending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Save className="h-3.5 w-3.5" />
                    )}
                    {slide.id ? "Guardar" : "Crear"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}

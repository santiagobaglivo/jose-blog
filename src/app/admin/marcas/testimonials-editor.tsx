"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowDown,
  ArrowUp,
  Loader2,
  Plus,
  Save,
  Star,
  Trash2,
  Upload,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import type { BrandTestimonial } from "@/lib/queries/brands";

import { deleteBrandTestimonial, upsertBrandTestimonial } from "./actions";

/**
 * Estado local de un testimonio en el editor.
 * - `id` ausente => nuevo (todavía no persistido).
 * - `dirty`      => hay cambios sin guardar respecto al último servidor.
 * - `pendingFile` => archivo seleccionado pendiente de subida (al guardar).
 *
 * Mismo patrón que team-editor.
 */
interface TestimonialDraft {
  /** id local estable (no-DB) para keys de React mientras no haya id real. */
  uid: string;
  id?: string;
  author_name: string;
  author_role: string;
  author_company: string;
  author_photo_url: string | null;
  quote: string;
  /** 0 = sin rating */
  rating: number;
  is_active: boolean;
  pendingFile: File | null;
  previewUrl: string | null;
  dirty: boolean;
}

interface TestimonialsEditorProps {
  brandId?: string;
  initialTestimonials: BrandTestimonial[];
}

const inputClass =
  "w-full h-10 px-3 bg-card border border-border/50 rounded-lg text-[0.875rem] text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/40 transition-all";
const textareaClass =
  "w-full px-3 py-2 bg-card border border-border/50 rounded-lg text-[0.875rem] text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/40 transition-all resize-y";
const labelClass = "block text-[0.75rem] font-medium text-foreground mb-1";

let counter = 0;
function makeUid() {
  counter += 1;
  return `testimonial-draft-${Date.now()}-${counter}`;
}

function toDraft(t: BrandTestimonial): TestimonialDraft {
  return {
    uid: t.id,
    id: t.id,
    author_name: t.author_name,
    author_role: t.author_role ?? "",
    author_company: t.author_company ?? "",
    author_photo_url: t.author_photo_url,
    quote: t.quote,
    rating: t.rating ?? 0,
    is_active: t.is_active,
    pendingFile: null,
    previewUrl: null,
    dirty: false,
  };
}

function emptyDraft(): TestimonialDraft {
  return {
    uid: makeUid(),
    author_name: "",
    author_role: "",
    author_company: "",
    author_photo_url: null,
    quote: "",
    rating: 0,
    is_active: true,
    pendingFile: null,
    previewUrl: null,
    dirty: true,
  };
}

export function TestimonialsEditor({ brandId, initialTestimonials }: TestimonialsEditorProps) {
  const router = useRouter();
  const [items, setItems] = useState<TestimonialDraft[]>(
    initialTestimonials.map(toDraft)
  );
  const [pendingUid, setPendingUid] = useState<string | null>(null);

  const disabled = !brandId;

  function updateDraft(uid: string, patch: Partial<TestimonialDraft>) {
    setItems((prev) =>
      prev.map((t) => (t.uid === uid ? { ...t, ...patch, dirty: true } : t))
    );
  }

  function addItem() {
    setItems((prev) => [...prev, emptyDraft()]);
  }

  function move(uid: string, dir: -1 | 1) {
    setItems((prev) => {
      const idx = prev.findIndex((t) => t.uid === uid);
      if (idx < 0) return prev;
      const target = idx + dir;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[target]] = [next[target], next[idx]];
      next[idx] = { ...next[idx], dirty: true };
      next[target] = { ...next[target], dirty: true };
      return next;
    });
  }

  async function handleSave(uid: string) {
    if (!brandId) {
      toast.error("Guardá la marca antes de cargar testimonios.");
      return;
    }
    const idx = items.findIndex((t) => t.uid === uid);
    if (idx < 0) return;
    const draft = items[idx];

    if (draft.author_name.trim().length < 2) {
      toast.error("El nombre del autor es obligatorio (mínimo 2 caracteres).");
      return;
    }
    if (draft.quote.trim().length < 10) {
      toast.error("El testimonio debe tener al menos 10 caracteres.");
      return;
    }

    const fd = new FormData();
    if (draft.id) fd.append("id", draft.id);
    fd.append("brand_id", brandId);
    fd.append("author_name", draft.author_name.trim());
    fd.append("author_role", draft.author_role.trim());
    fd.append("author_company", draft.author_company.trim());
    fd.append("author_photo_url", draft.author_photo_url ?? "");
    fd.append("quote", draft.quote.trim());
    if (draft.rating > 0) fd.append("rating", String(draft.rating));
    fd.append("display_order", String(idx));
    fd.append("is_active", draft.is_active ? "true" : "false");
    if (draft.pendingFile) fd.append("file", draft.pendingFile);

    setPendingUid(uid);
    const result = await upsertBrandTestimonial(fd);
    setPendingUid(null);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Testimonio guardado");
    if (draft.previewUrl) URL.revokeObjectURL(draft.previewUrl);
    setItems((prev) =>
      prev.map((t) =>
        t.uid === uid
          ? {
              ...t,
              id: result.id,
              uid: result.id,
              author_photo_url: result.author_photo_url,
              pendingFile: null,
              previewUrl: null,
              dirty: false,
            }
          : t
      )
    );
    router.refresh();
  }

  async function handleDelete(uid: string) {
    const draft = items.find((t) => t.uid === uid);
    if (!draft) return;

    if (!draft.id) {
      // No persistido, lo sacamos local.
      if (draft.previewUrl) URL.revokeObjectURL(draft.previewUrl);
      setItems((prev) => prev.filter((t) => t.uid !== uid));
      return;
    }

    const confirmed = window.confirm("¿Eliminar este testimonio? No se puede deshacer.");
    if (!confirmed) return;

    setPendingUid(uid);
    const result = await deleteBrandTestimonial(draft.id);
    setPendingUid(null);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Testimonio eliminado");
    if (draft.previewUrl) URL.revokeObjectURL(draft.previewUrl);
    setItems((prev) => prev.filter((t) => t.uid !== uid));
    router.refresh();
  }

  return (
    <div className="bg-card border border-border/50 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">
            Testimonios de clientes{" "}
            <span className="text-muted-foreground/60 font-normal">
              ({items.length})
            </span>
          </h2>
          <p className="mt-0.5 text-[0.75rem] text-muted-foreground/70">
            Aparecen en un carrusel en la home pública. Si no hay testimonios activos, no
            se muestra la sección.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addItem}
          disabled={disabled}
          className="gap-1.5"
        >
          <Plus className="h-3.5 w-3.5" />
          Agregar testimonio
        </Button>
      </div>

      {disabled && (
        <p className="text-[0.75rem] text-muted-foreground/70 border border-dashed border-border/50 rounded-lg p-3">
          Guardá la marca primero para habilitar el editor de testimonios.
        </p>
      )}

      {items.length === 0 ? (
        <p className="text-[0.8125rem] text-muted-foreground py-4 text-center border border-dashed border-border/50 rounded-lg">
          Aún no hay testimonios. Agregá el primero con el botón de arriba.
        </p>
      ) : (
        <ul className="space-y-3">
          {items.map((item, idx) => (
            <TestimonialRow
              key={item.uid}
              item={item}
              index={idx}
              total={items.length}
              pending={pendingUid === item.uid}
              onChange={(patch) => updateDraft(item.uid, patch)}
              onSave={() => handleSave(item.uid)}
              onDelete={() => handleDelete(item.uid)}
              onMove={(dir) => move(item.uid, dir)}
              disabled={disabled}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

interface TestimonialRowProps {
  item: TestimonialDraft;
  index: number;
  total: number;
  pending: boolean;
  disabled: boolean;
  onChange: (patch: Partial<TestimonialDraft>) => void;
  onSave: () => void;
  onDelete: () => void;
  onMove: (dir: -1 | 1) => void;
}

function TestimonialRow({
  item,
  index,
  total,
  pending,
  disabled,
  onChange,
  onSave,
  onDelete,
  onMove,
}: TestimonialRowProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const previewSrc = item.previewUrl ?? item.author_photo_url ?? null;

  function handleFile(file: File | undefined) {
    if (!file) return;
    if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
    const url = URL.createObjectURL(file);
    onChange({ pendingFile: file, previewUrl: url });
  }

  function setRating(value: number) {
    // Click sobre la misma estrella seleccionada => limpia el rating
    onChange({ rating: item.rating === value ? 0 : value });
  }

  return (
    <li className="border border-border/50 rounded-lg p-3 bg-secondary/20">
      <div className="flex items-start gap-3">
        <div className="flex flex-col gap-1 pt-1">
          <button
            type="button"
            onClick={() => onMove(-1)}
            disabled={index === 0 || disabled || pending}
            className="h-6 w-6 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Subir"
          >
            <ArrowUp className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={() => onMove(1)}
            disabled={index === total - 1 || disabled || pending}
            className="h-6 w-6 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Bajar"
          >
            <ArrowDown className="h-3 w-3" />
          </button>
        </div>

        <div className="flex-1 space-y-3 min-w-0">
          <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-3">
            <div className="space-y-2">
              <div className="aspect-square rounded-full overflow-hidden bg-secondary/40 border border-border/50 relative w-32 h-32 mx-auto">
                {previewSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewSrc}
                    alt={item.author_name || "Autor"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/40 gap-1">
                    <UserRound className="h-8 w-8" />
                    <span className="text-[0.7rem]">Sin foto</span>
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
                {previewSrc ? "Reemplazar" : "Subir foto"}
              </button>
              <input
                type="url"
                value={item.author_photo_url ?? ""}
                onChange={(e) =>
                  onChange({ author_photo_url: e.target.value || null, pendingFile: null })
                }
                placeholder="O URL externa..."
                className="w-full h-8 px-2 bg-card border border-border/50 rounded-md text-[0.75rem]"
                disabled={disabled}
              />
            </div>

            <div className="space-y-2 min-w-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className={labelClass} htmlFor={`testimonial-name-${item.uid}`}>
                    Nombre del autor *
                  </label>
                  <input
                    id={`testimonial-name-${item.uid}`}
                    className={inputClass}
                    value={item.author_name}
                    onChange={(e) => onChange({ author_name: e.target.value })}
                    placeholder="Ej. Juan Pérez"
                    maxLength={120}
                    disabled={disabled}
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor={`testimonial-role-${item.uid}`}>
                    Cargo
                  </label>
                  <input
                    id={`testimonial-role-${item.uid}`}
                    className={inputClass}
                    value={item.author_role}
                    onChange={(e) => onChange({ author_role: e.target.value })}
                    placeholder="Ej. Director financiero"
                    maxLength={120}
                    disabled={disabled}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass} htmlFor={`testimonial-company-${item.uid}`}>
                  Empresa
                </label>
                <input
                  id={`testimonial-company-${item.uid}`}
                  className={inputClass}
                  value={item.author_company}
                  onChange={(e) => onChange({ author_company: e.target.value })}
                  placeholder="Ej. Constructora del Sur S.A."
                  maxLength={120}
                  disabled={disabled}
                />
              </div>

              <div>
                <label className={labelClass} htmlFor={`testimonial-quote-${item.uid}`}>
                  Testimonio *
                </label>
                <textarea
                  id={`testimonial-quote-${item.uid}`}
                  className={textareaClass}
                  rows={4}
                  value={item.quote}
                  onChange={(e) => onChange({ quote: e.target.value })}
                  placeholder="Texto del testimonio (10 a 1000 caracteres)"
                  maxLength={1000}
                  disabled={disabled}
                />
                <p className="mt-1 text-[0.7rem] text-muted-foreground/60">
                  {item.quote.trim().length}/1000
                </p>
              </div>

              <div>
                <label className={labelClass}>Calificación</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setRating(n)}
                      disabled={disabled || pending}
                      aria-label={`${n} estrella${n === 1 ? "" : "s"}`}
                      className="p-0.5 rounded hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Star
                        className={`h-5 w-5 ${
                          n <= item.rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-muted-foreground/40"
                        }`}
                      />
                    </button>
                  ))}
                  {item.rating > 0 && (
                    <span className="ml-2 text-[0.75rem] text-muted-foreground">
                      {item.rating}/5
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="inline-flex items-center gap-2 text-[0.75rem] text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={item.is_active}
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
                    aria-label="Eliminar testimonio"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Eliminar
                  </button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={onSave}
                    disabled={disabled || pending || !item.dirty}
                    className="gap-1.5 h-8"
                  >
                    {pending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Save className="h-3.5 w-3.5" />
                    )}
                    {item.id ? "Guardar" : "Crear"}
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

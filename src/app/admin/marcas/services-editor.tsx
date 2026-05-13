"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  ArrowDown,
  ArrowUp,
  ImageIcon,
  Loader2,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ServiceIcon, SERVICE_ICON_NAMES } from "@/components/shared/service-icon";

import { uploadBrandServiceImage } from "./actions";

export interface ServiceDraft {
  id?: string;
  name: string;
  description: string;
  icon: string;
  image_url: string;
  is_active: boolean;
}

interface ServicesEditorProps {
  brandId?: string;
  services: ServiceDraft[];
  onChange: (next: ServiceDraft[]) => void;
}

const inputClass =
  "w-full h-10 px-3 bg-card border border-border/50 rounded-lg text-[0.875rem] text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/40 transition-all";
const textareaClass =
  "w-full px-3 py-2 bg-card border border-border/50 rounded-lg text-[0.875rem] text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/40 transition-all resize-y";
const microInputClass =
  "w-full h-8 px-2 bg-card border border-border/50 rounded-md text-[0.75rem] text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/40 transition-all";
const microLabelClass = "block text-[0.7rem] font-medium text-muted-foreground mb-1";

export function ServicesEditor({ brandId, services, onChange }: ServicesEditorProps) {
  const add = () =>
    onChange([
      ...services,
      { name: "", description: "", icon: "", image_url: "", is_active: true },
    ]);

  const remove = (index: number) =>
    onChange(services.filter((_, i) => i !== index));

  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= services.length) return;
    const next = [...services];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const update = (index: number, patch: Partial<ServiceDraft>) =>
    onChange(services.map((s, i) => (i === index ? { ...s, ...patch } : s)));

  return (
    <div className="bg-card border border-border/50 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">
            Servicios{" "}
            <span className="text-muted-foreground/60 font-normal">
              ({services.length})
            </span>
          </h2>
          <p className="mt-0.5 text-[0.75rem] text-muted-foreground/70">
            Cada servicio puede tener un icono (lucide), una imagen subida o
            ninguno (cae a un check default).
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={add}
          className="gap-1.5"
        >
          <Plus className="h-3.5 w-3.5" />
          Agregar servicio
        </Button>
      </div>

      {services.length === 0 ? (
        <p className="text-[0.8125rem] text-muted-foreground py-4 text-center border border-dashed border-border/50 rounded-lg">
          Aún no hay servicios. Agregá el primero con el botón de arriba.
        </p>
      ) : (
        <ul className="space-y-3">
          {services.map((service, idx) => (
            <ServiceRow
              key={service.id ?? `idx-${idx}`}
              service={service}
              index={idx}
              total={services.length}
              brandId={brandId}
              onChange={(patch) => update(idx, patch)}
              onRemove={() => remove(idx)}
              onMove={(dir) => move(idx, dir)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

interface ServiceRowProps {
  service: ServiceDraft;
  index: number;
  total: number;
  brandId?: string;
  onChange: (patch: Partial<ServiceDraft>) => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
}

function ServiceRow({
  service,
  index,
  total,
  brandId,
  onChange,
  onRemove,
  onMove,
}: ServiceRowProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    if (!brandId) {
      toast.error("Guardá la marca primero para subir imágenes de servicios.");
      return;
    }
    setUploading(true);
    const fd = new FormData();
    fd.append("brandId", brandId);
    fd.append("file", file);
    const result = await uploadBrandServiceImage(fd);
    setUploading(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    // Si hay imagen, ignoramos el icon (la imagen tiene prioridad en el render).
    onChange({ image_url: result.url, icon: "" });
    toast.success("Imagen subida");
  }

  const hasImage = service.image_url.trim().length > 0;
  const hasIcon = service.icon.trim().length > 0;

  return (
    <li className="border border-border/50 rounded-lg p-3 bg-secondary/20">
      <div className="flex items-start gap-2">
        <div className="flex flex-col gap-1 pt-1">
          <button
            type="button"
            onClick={() => onMove(-1)}
            disabled={index === 0}
            className="h-6 w-6 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Subir"
          >
            <ArrowUp className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={() => onMove(1)}
            disabled={index === total - 1}
            className="h-6 w-6 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Bajar"
          >
            <ArrowDown className="h-3 w-3" />
          </button>
        </div>

        <div className="flex-1 space-y-3 min-w-0">
          <div className="grid grid-cols-1 md:grid-cols-[120px_1fr] gap-3">
            <div className="space-y-2">
              <div className="aspect-square rounded-md overflow-hidden bg-secondary/40 border border-border/50 flex items-center justify-center">
                {hasImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={service.image_url}
                    alt={service.name || "Servicio"}
                    className="w-full h-full object-cover"
                  />
                ) : hasIcon ? (
                  <ServiceIcon
                    name={service.icon}
                    className="h-10 w-10 text-muted-foreground"
                    fallback={
                      <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
                    }
                  />
                ) : (
                  <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
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
                disabled={uploading || !brandId}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || !brandId}
                className="w-full inline-flex items-center justify-center gap-1.5 h-8 px-2 text-[0.7rem] font-medium border border-border rounded-md hover:bg-secondary/60 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Upload className="h-3 w-3" />
                )}
                {hasImage ? "Reemplazar" : "Subir imagen"}
              </button>
              {hasImage && (
                <button
                  type="button"
                  onClick={() => onChange({ image_url: "" })}
                  className="w-full inline-flex items-center justify-center gap-1 h-7 px-2 text-[0.7rem] text-muted-foreground hover:text-destructive rounded transition-colors"
                >
                  <X className="h-3 w-3" />
                  Quitar imagen
                </button>
              )}
              {!brandId && (
                <p className="text-[0.65rem] text-muted-foreground/70 leading-tight">
                  Guardá la marca para habilitar el upload.
                </p>
              )}
            </div>

            <div className="flex-1 space-y-2 min-w-0">
              <input
                className={inputClass}
                value={service.name}
                onChange={(e) => onChange({ name: e.target.value })}
                placeholder="Nombre del servicio"
              />
              <textarea
                className={textareaClass}
                rows={2}
                value={service.description}
                onChange={(e) => onChange({ description: e.target.value })}
                placeholder="Descripción opcional"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className={microLabelClass}>
                    Icono lucide{" "}
                    <span className="text-muted-foreground/50 font-normal">
                      (alternativa a imagen)
                    </span>
                  </label>
                  <input
                    list={`lucide-icons-${index}`}
                    className={microInputClass}
                    value={service.icon}
                    onChange={(e) =>
                      onChange({ icon: e.target.value.trim().toLowerCase() })
                    }
                    placeholder="ej: shield-check"
                    disabled={hasImage}
                  />
                  <datalist id={`lucide-icons-${index}`}>
                    {SERVICE_ICON_NAMES.map((n) => (
                      <option key={n} value={n} />
                    ))}
                  </datalist>
                  {hasImage && (
                    <p className="text-[0.65rem] text-muted-foreground/60 mt-0.5">
                      Hay imagen cargada — el icono se ignora.
                    </p>
                  )}
                </div>
                <div>
                  <label className={microLabelClass}>
                    URL de imagen externa
                  </label>
                  <input
                    type="url"
                    className={microInputClass}
                    value={service.image_url}
                    onChange={(e) =>
                      onChange({ image_url: e.target.value.trim() })
                    }
                    placeholder="https://..."
                  />
                </div>
              </div>

              <label className="inline-flex items-center gap-2 text-[0.75rem] text-muted-foreground pt-1">
                <input
                  type="checkbox"
                  checked={service.is_active}
                  onChange={(e) => onChange({ is_active: e.target.checked })}
                />
                Activo
              </label>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onRemove}
          className="h-8 w-8 flex items-center justify-center rounded text-muted-foreground hover:text-destructive hover:bg-red-50 transition-colors"
          aria-label="Eliminar servicio"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </li>
  );
}

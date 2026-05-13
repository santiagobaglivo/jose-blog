"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

export interface ServiceDraft {
  id?: string;
  name: string;
  description: string;
  is_active: boolean;
}

interface ServicesEditorProps {
  services: ServiceDraft[];
  onChange: (next: ServiceDraft[]) => void;
}

const inputClass =
  "w-full h-10 px-3 bg-card border border-border/50 rounded-lg text-[0.875rem] text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/40 transition-all";
const textareaClass =
  "w-full px-3 py-2 bg-card border border-border/50 rounded-lg text-[0.875rem] text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/40 transition-all resize-y";

export function ServicesEditor({ services, onChange }: ServicesEditorProps) {
  const add = () =>
    onChange([...services, { name: "", description: "", is_active: true }]);

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
        <h2 className="text-sm font-semibold text-foreground">
          Servicios{" "}
          <span className="text-muted-foreground/60 font-normal">
            ({services.length})
          </span>
        </h2>
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
            <li
              key={service.id ?? idx}
              className="border border-border/50 rounded-lg p-3 bg-secondary/20"
            >
              <div className="flex items-start gap-2">
                <div className="flex flex-col gap-1 pt-1">
                  <button
                    type="button"
                    onClick={() => move(idx, -1)}
                    disabled={idx === 0}
                    className="h-6 w-6 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Subir"
                  >
                    <ArrowUp className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(idx, 1)}
                    disabled={idx === services.length - 1}
                    className="h-6 w-6 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Bajar"
                  >
                    <ArrowDown className="h-3 w-3" />
                  </button>
                </div>

                <div className="flex-1 space-y-2">
                  <input
                    className={inputClass}
                    value={service.name}
                    onChange={(e) => update(idx, { name: e.target.value })}
                    placeholder="Nombre del servicio"
                  />
                  <textarea
                    className={textareaClass}
                    rows={2}
                    value={service.description}
                    onChange={(e) =>
                      update(idx, { description: e.target.value })
                    }
                    placeholder="Descripción opcional"
                  />
                  <label className="inline-flex items-center gap-2 text-[0.75rem] text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={service.is_active}
                      onChange={(e) =>
                        update(idx, { is_active: e.target.checked })
                      }
                    />
                    Activo
                  </label>
                </div>

                <button
                  type="button"
                  onClick={() => remove(idx)}
                  className="h-8 w-8 flex items-center justify-center rounded text-muted-foreground hover:text-destructive hover:bg-red-50 transition-colors"
                  aria-label="Eliminar servicio"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

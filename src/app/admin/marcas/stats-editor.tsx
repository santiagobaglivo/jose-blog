"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Loader2, Plus, Save, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { BrandStat } from "@/lib/queries/brands";

import { deleteBrandStat, upsertBrandStat } from "./actions";

/**
 * Estado local de un stat en el editor.
 * - `id` ausente => stat nuevo (todavía no persistido).
 * - `dirty`      => hay cambios sin guardar respecto al último servidor.
 *
 * Patrón inspirado en services-editor (inline) + slides-editor (save individual).
 */
interface StatDraft {
  /** id local estable para keys de React mientras no haya id real. */
  uid: string;
  id?: string;
  label: string;
  value: string;
  suffix: string;
  is_active: boolean;
  dirty: boolean;
}

interface StatsEditorProps {
  brandId?: string;
  initialStats: BrandStat[];
}

const inputClass =
  "w-full h-10 px-3 bg-card border border-border/50 rounded-lg text-[0.875rem] text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/40 transition-all";

let counter = 0;
function makeUid() {
  counter += 1;
  return `stat-draft-${Date.now()}-${counter}`;
}

function toDraft(stat: BrandStat): StatDraft {
  return {
    uid: stat.id,
    id: stat.id,
    label: stat.label,
    value: stat.value,
    suffix: stat.suffix ?? "",
    is_active: stat.is_active,
    dirty: false,
  };
}

function emptyDraft(): StatDraft {
  return {
    uid: makeUid(),
    label: "",
    value: "",
    suffix: "",
    is_active: true,
    dirty: true,
  };
}

export function StatsEditor({ brandId, initialStats }: StatsEditorProps) {
  const router = useRouter();
  const [stats, setStats] = useState<StatDraft[]>(initialStats.map(toDraft));
  const [pendingUid, setPendingUid] = useState<string | null>(null);

  const disabled = !brandId;

  function updateDraft(uid: string, patch: Partial<StatDraft>) {
    setStats((prev) =>
      prev.map((s) => (s.uid === uid ? { ...s, ...patch, dirty: true } : s))
    );
  }

  function add() {
    setStats((prev) => [...prev, emptyDraft()]);
  }

  function move(uid: string, dir: -1 | 1) {
    setStats((prev) => {
      const idx = prev.findIndex((s) => s.uid === uid);
      if (idx < 0) return prev;
      const target = idx + dir;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[target]] = [next[target], next[idx]];
      // marcamos como dirty para que se persista el display_order nuevo al guardar
      next[idx] = { ...next[idx], dirty: true };
      next[target] = { ...next[target], dirty: true };
      return next;
    });
  }

  async function handleSave(uid: string) {
    if (!brandId) {
      toast.error("Guardá la marca antes de cargar cifras.");
      return;
    }
    const idx = stats.findIndex((s) => s.uid === uid);
    if (idx < 0) return;
    const draft = stats[idx];

    if (draft.label.trim().length < 2) {
      toast.error("El label es obligatorio (mínimo 2 caracteres).");
      return;
    }
    if (draft.value.trim().length < 1) {
      toast.error("El valor es obligatorio.");
      return;
    }

    const fd = new FormData();
    if (draft.id) fd.append("id", draft.id);
    fd.append("brand_id", brandId);
    fd.append("label", draft.label.trim());
    fd.append("value", draft.value.trim());
    fd.append("suffix", draft.suffix.trim());
    fd.append("display_order", String(idx));
    fd.append("is_active", draft.is_active ? "true" : "false");

    setPendingUid(uid);
    const result = await upsertBrandStat(fd);
    setPendingUid(null);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Cifra guardada");
    setStats((prev) =>
      prev.map((s) =>
        s.uid === uid ? { ...s, id: result.id, uid: result.id, dirty: false } : s
      )
    );
    router.refresh();
  }

  async function handleDelete(uid: string) {
    const draft = stats.find((s) => s.uid === uid);
    if (!draft) return;

    if (!draft.id) {
      setStats((prev) => prev.filter((s) => s.uid !== uid));
      return;
    }

    const confirmed = window.confirm("¿Eliminar esta cifra? No se puede deshacer.");
    if (!confirmed) return;

    setPendingUid(uid);
    const result = await deleteBrandStat(draft.id);
    setPendingUid(null);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Cifra eliminada");
    setStats((prev) => prev.filter((s) => s.uid !== uid));
    router.refresh();
  }

  return (
    <div className="bg-card border border-border/50 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">
            Cifras destacadas{" "}
            <span className="text-muted-foreground/60 font-normal">
              ({stats.length})
            </span>
          </h2>
          <p className="mt-0.5 text-[0.75rem] text-muted-foreground/70">
            Contadores tipo &quot;+14K colaboradores&quot; o &quot;37 años de experiencia&quot;.
            El número se anima al entrar en pantalla.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={add}
          disabled={disabled}
          className="gap-1.5"
        >
          <Plus className="h-3.5 w-3.5" />
          Agregar cifra
        </Button>
      </div>

      {disabled && (
        <p className="text-[0.75rem] text-muted-foreground/70 border border-dashed border-border/50 rounded-lg p-3">
          Guardá la marca primero para habilitar el editor de cifras.
        </p>
      )}

      {stats.length === 0 ? (
        <p className="text-[0.8125rem] text-muted-foreground py-4 text-center border border-dashed border-border/50 rounded-lg">
          Aún no hay cifras. Agregá la primera con el botón de arriba.
        </p>
      ) : (
        <ul className="space-y-3">
          {stats.map((stat, idx) => {
            const pending = pendingUid === stat.uid;
            return (
              <li
                key={stat.uid}
                className="border border-border/50 rounded-lg p-3 bg-secondary/20"
              >
                <div className="flex items-start gap-2">
                  <div className="flex flex-col gap-1 pt-1">
                    <button
                      type="button"
                      onClick={() => move(stat.uid, -1)}
                      disabled={idx === 0 || disabled || pending}
                      className="h-6 w-6 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed"
                      aria-label="Subir"
                    >
                      <ArrowUp className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => move(stat.uid, 1)}
                      disabled={idx === stats.length - 1 || disabled || pending}
                      className="h-6 w-6 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed"
                      aria-label="Bajar"
                    >
                      <ArrowDown className="h-3 w-3" />
                    </button>
                  </div>

                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-[1fr_120px_120px] gap-2 min-w-0">
                    <input
                      className={inputClass}
                      value={stat.label}
                      onChange={(e) => updateDraft(stat.uid, { label: e.target.value })}
                      placeholder='Label (ej. "colaboradores", "años de experiencia")'
                      maxLength={100}
                      disabled={disabled}
                    />
                    <input
                      className={inputClass}
                      value={stat.value}
                      onChange={(e) => updateDraft(stat.uid, { value: e.target.value })}
                      placeholder='Valor (ej. "14", "37")'
                      maxLength={30}
                      disabled={disabled}
                    />
                    <input
                      className={inputClass}
                      value={stat.suffix}
                      onChange={(e) => updateDraft(stat.uid, { suffix: e.target.value })}
                      placeholder='Sufijo ("+", "K", "M", "años")'
                      maxLength={20}
                      disabled={disabled}
                    />

                    <div className="sm:col-span-3 flex items-center justify-between pt-1">
                      <label className="inline-flex items-center gap-2 text-[0.75rem] text-muted-foreground">
                        <input
                          type="checkbox"
                          checked={stat.is_active}
                          onChange={(e) =>
                            updateDraft(stat.uid, { is_active: e.target.checked })
                          }
                          disabled={disabled}
                        />
                        Activo
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleDelete(stat.uid)}
                          disabled={disabled || pending}
                          className="h-8 px-2 inline-flex items-center gap-1 text-[0.75rem] text-muted-foreground hover:text-destructive hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                          aria-label="Eliminar cifra"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Eliminar
                        </button>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => handleSave(stat.uid)}
                          disabled={disabled || pending || !stat.dirty}
                          className="gap-1.5 h-8"
                        >
                          {pending ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Save className="h-3.5 w-3.5" />
                          )}
                          {stat.id ? "Guardar" : "Crear"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

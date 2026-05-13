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
  Trash2,
  Upload,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import type { BrandTeamMember } from "@/lib/queries/brands";

import { deleteBrandTeamMember, upsertBrandTeamMember } from "./actions";

/**
 * Estado local de un miembro del equipo.
 * - `id` ausente => miembro nuevo (todavía no persistido).
 * - `dirty`      => hay cambios sin guardar respecto al último servidor.
 * - `pendingFile` => archivo seleccionado pendiente de subida (al guardar).
 *
 * Patrón inspirado en slides-editor (save individual + upload + reorder con flechas).
 */
interface TeamMemberDraft {
  /** id local estable (no-DB) para keys de React mientras no haya id real. */
  uid: string;
  id?: string;
  member_name: string;
  role: string;
  photo_url: string | null;
  bio: string;
  is_active: boolean;
  pendingFile: File | null;
  /** preview local (object URL) cuando hay pendingFile. */
  previewUrl: string | null;
  dirty: boolean;
}

interface TeamEditorProps {
  brandId?: string;
  initialTeam: BrandTeamMember[];
}

const inputClass =
  "w-full h-10 px-3 bg-card border border-border/50 rounded-lg text-[0.875rem] text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/40 transition-all";
const textareaClass =
  "w-full px-3 py-2 bg-card border border-border/50 rounded-lg text-[0.875rem] text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/40 transition-all resize-y";
const labelClass = "block text-[0.75rem] font-medium text-foreground mb-1";

let counter = 0;
function makeUid() {
  counter += 1;
  return `team-draft-${Date.now()}-${counter}`;
}

function toDraft(member: BrandTeamMember): TeamMemberDraft {
  return {
    uid: member.id,
    id: member.id,
    member_name: member.member_name,
    role: member.role,
    photo_url: member.photo_url,
    bio: member.bio ?? "",
    is_active: member.is_active,
    pendingFile: null,
    previewUrl: null,
    dirty: false,
  };
}

function emptyDraft(): TeamMemberDraft {
  return {
    uid: makeUid(),
    member_name: "",
    role: "",
    photo_url: null,
    bio: "",
    is_active: true,
    pendingFile: null,
    previewUrl: null,
    dirty: true,
  };
}

export function TeamEditor({ brandId, initialTeam }: TeamEditorProps) {
  const router = useRouter();
  const [members, setMembers] = useState<TeamMemberDraft[]>(initialTeam.map(toDraft));
  const [pendingUid, setPendingUid] = useState<string | null>(null);

  const disabled = !brandId;

  function updateDraft(uid: string, patch: Partial<TeamMemberDraft>) {
    setMembers((prev) =>
      prev.map((m) => (m.uid === uid ? { ...m, ...patch, dirty: true } : m))
    );
  }

  function addMember() {
    setMembers((prev) => [...prev, emptyDraft()]);
  }

  function move(uid: string, dir: -1 | 1) {
    setMembers((prev) => {
      const idx = prev.findIndex((m) => m.uid === uid);
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
      toast.error("Guardá la marca antes de cargar miembros del equipo.");
      return;
    }
    const idx = members.findIndex((m) => m.uid === uid);
    if (idx < 0) return;
    const draft = members[idx];

    if (draft.member_name.trim().length < 2) {
      toast.error("El nombre es obligatorio (mínimo 2 caracteres).");
      return;
    }
    if (draft.role.trim().length < 2) {
      toast.error("El cargo es obligatorio (mínimo 2 caracteres).");
      return;
    }

    const fd = new FormData();
    if (draft.id) fd.append("id", draft.id);
    fd.append("brand_id", brandId);
    fd.append("member_name", draft.member_name.trim());
    fd.append("role", draft.role.trim());
    fd.append("photo_url", draft.photo_url ?? "");
    fd.append("bio", draft.bio.trim());
    fd.append("display_order", String(idx));
    fd.append("is_active", draft.is_active ? "true" : "false");
    if (draft.pendingFile) fd.append("file", draft.pendingFile);

    setPendingUid(uid);
    const result = await upsertBrandTeamMember(fd);
    setPendingUid(null);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Miembro guardado");
    if (draft.previewUrl) URL.revokeObjectURL(draft.previewUrl);
    setMembers((prev) =>
      prev.map((m) =>
        m.uid === uid
          ? {
              ...m,
              id: result.id,
              uid: result.id,
              photo_url: result.photo_url,
              pendingFile: null,
              previewUrl: null,
              dirty: false,
            }
          : m
      )
    );
    router.refresh();
  }

  async function handleDelete(uid: string) {
    const draft = members.find((m) => m.uid === uid);
    if (!draft) return;

    if (!draft.id) {
      // No persistido, lo sacamos local.
      if (draft.previewUrl) URL.revokeObjectURL(draft.previewUrl);
      setMembers((prev) => prev.filter((m) => m.uid !== uid));
      return;
    }

    const confirmed = window.confirm("¿Eliminar este miembro? No se puede deshacer.");
    if (!confirmed) return;

    setPendingUid(uid);
    const result = await deleteBrandTeamMember(draft.id);
    setPendingUid(null);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Miembro eliminado");
    if (draft.previewUrl) URL.revokeObjectURL(draft.previewUrl);
    setMembers((prev) => prev.filter((m) => m.uid !== uid));
    router.refresh();
  }

  return (
    <div className="bg-card border border-border/50 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">
            Equipo profesional{" "}
            <span className="text-muted-foreground/60 font-normal">
              ({members.length})
            </span>
          </h2>
          <p className="mt-0.5 text-[0.75rem] text-muted-foreground/70">
            Miembros con foto, nombre, cargo y bio que aparecen en la sección
            &quot;Equipo&quot; de la home pública.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addMember}
          disabled={disabled}
          className="gap-1.5"
        >
          <Plus className="h-3.5 w-3.5" />
          Agregar miembro
        </Button>
      </div>

      {disabled && (
        <p className="text-[0.75rem] text-muted-foreground/70 border border-dashed border-border/50 rounded-lg p-3">
          Guardá la marca primero para habilitar el editor de equipo.
        </p>
      )}

      {members.length === 0 ? (
        <p className="text-[0.8125rem] text-muted-foreground py-4 text-center border border-dashed border-border/50 rounded-lg">
          Aún no hay miembros del equipo. Agregá el primero con el botón de arriba.
        </p>
      ) : (
        <ul className="space-y-3">
          {members.map((member, idx) => (
            <MemberRow
              key={member.uid}
              member={member}
              index={idx}
              total={members.length}
              pending={pendingUid === member.uid}
              onChange={(patch) => updateDraft(member.uid, patch)}
              onSave={() => handleSave(member.uid)}
              onDelete={() => handleDelete(member.uid)}
              onMove={(dir) => move(member.uid, dir)}
              disabled={disabled}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

interface MemberRowProps {
  member: TeamMemberDraft;
  index: number;
  total: number;
  pending: boolean;
  disabled: boolean;
  onChange: (patch: Partial<TeamMemberDraft>) => void;
  onSave: () => void;
  onDelete: () => void;
  onMove: (dir: -1 | 1) => void;
}

function MemberRow({
  member,
  index,
  total,
  pending,
  disabled,
  onChange,
  onSave,
  onDelete,
  onMove,
}: MemberRowProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const previewSrc = member.previewUrl ?? member.photo_url ?? null;

  function handleFile(file: File | undefined) {
    if (!file) return;
    if (member.previewUrl) URL.revokeObjectURL(member.previewUrl);
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
                    alt={member.member_name || "Miembro del equipo"}
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
                value={member.photo_url ?? ""}
                onChange={(e) =>
                  onChange({ photo_url: e.target.value || null, pendingFile: null })
                }
                placeholder="O URL externa..."
                className="w-full h-8 px-2 bg-card border border-border/50 rounded-md text-[0.75rem]"
                disabled={disabled}
              />
            </div>

            <div className="space-y-2 min-w-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className={labelClass} htmlFor={`team-name-${member.uid}`}>
                    Nombre *
                  </label>
                  <input
                    id={`team-name-${member.uid}`}
                    className={inputClass}
                    value={member.member_name}
                    onChange={(e) => onChange({ member_name: e.target.value })}
                    placeholder="Ej. María Pérez"
                    maxLength={120}
                    disabled={disabled}
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor={`team-role-${member.uid}`}>
                    Cargo *
                  </label>
                  <input
                    id={`team-role-${member.uid}`}
                    className={inputClass}
                    value={member.role}
                    onChange={(e) => onChange({ role: e.target.value })}
                    placeholder="Ej. Directora general"
                    maxLength={120}
                    disabled={disabled}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass} htmlFor={`team-bio-${member.uid}`}>
                  Bio
                </label>
                <textarea
                  id={`team-bio-${member.uid}`}
                  className={textareaClass}
                  rows={3}
                  value={member.bio}
                  onChange={(e) => onChange({ bio: e.target.value })}
                  placeholder="Trayectoria, especialidad, frase corta (opcional)"
                  maxLength={800}
                  disabled={disabled}
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="inline-flex items-center gap-2 text-[0.75rem] text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={member.is_active}
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
                    aria-label="Eliminar miembro"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Eliminar
                  </button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={onSave}
                    disabled={disabled || pending || !member.dirty}
                    className="gap-1.5 h-8"
                  >
                    {pending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Save className="h-3.5 w-3.5" />
                    )}
                    {member.id ? "Guardar" : "Crear"}
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

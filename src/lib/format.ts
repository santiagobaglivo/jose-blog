import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export function formatLongDate(iso: string | null | undefined): string {
  if (!iso) return "";
  return format(new Date(iso), "d 'de' MMMM 'de' yyyy", { locale: es });
}

export function formatRelative(iso: string | null | undefined): string {
  if (!iso) return "";
  return formatDistanceToNow(new Date(iso), { locale: es, addSuffix: true });
}

export function readTimeLabel(minutes: number | null | undefined): string {
  const m = Math.max(1, Math.round(minutes ?? 1));
  return `${m} min de lectura`;
}

export function initialsFromName(name: string | null | undefined, fallbackEmail?: string | null): string {
  const source = (name ?? "").trim() || fallbackEmail?.split("@")[0] || "";
  if (!source) return "U";
  const parts = source.split(/\s+/).filter(Boolean);
  const initials = parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}` : source.slice(0, 2);
  return initials.toUpperCase();
}

// Mappings DB → UI usados en el shape público.
export type DbPostStatus = "draft" | "scheduled" | "published" | "archived";
export type UiPostStatus = "publicado" | "borrador" | "programado";
export function postStatusDbToUi(s: DbPostStatus): UiPostStatus {
  if (s === "published") return "publicado";
  if (s === "scheduled") return "programado";
  return "borrador";
}

export type DbCommentStatus = "pending" | "approved" | "rejected";
export type UiCommentStatus = "aprobado" | "pendiente" | "rechazado";
export function commentStatusDbToUi(s: DbCommentStatus): UiCommentStatus {
  if (s === "approved") return "aprobado";
  if (s === "rejected") return "rechazado";
  return "pendiente";
}

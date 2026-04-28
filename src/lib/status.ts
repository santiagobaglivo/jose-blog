import { Receipt, Users, Building2, Calculator, HelpCircle } from "lucide-react";
import type { Comment } from "@/lib/mock-data";

type StatusEntry = { label: string; className: string };

export const postStatusMap: Record<string, StatusEntry> = {
  publicado: { label: "Publicado", className: "bg-green-50 text-green-700 border-green-200" },
  borrador: { label: "Borrador", className: "bg-gray-50 text-gray-600 border-gray-200" },
  programado: { label: "Programado", className: "bg-blue-50 text-blue-700 border-blue-200" },
  published: { label: "Publicado", className: "bg-green-50 text-green-700 border-green-200" },
  draft: { label: "Borrador", className: "bg-gray-50 text-gray-600 border-gray-200" },
  scheduled: { label: "Programado", className: "bg-blue-50 text-blue-700 border-blue-200" },
  archived: { label: "Archivado", className: "bg-amber-50 text-amber-700 border-amber-200" },
};

export const commentStatusMap: Record<Comment["status"], StatusEntry> = {
  aprobado: { label: "Aprobado", className: "bg-green-50 text-green-700 border-green-200" },
  pendiente: { label: "Pendiente", className: "bg-orange-50 text-orange-600 border-orange-200" },
  rechazado: { label: "Rechazado", className: "bg-red-50 text-red-600 border-red-200" },
};

export const forumIconMap: Record<string, React.ElementType> = {
  receipt: Receipt,
  users: Users,
  building: Building2,
  calculator: Calculator,
  "help-circle": HelpCircle,
};

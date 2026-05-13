"use server";

import { headers } from "next/headers";
import { z } from "zod";

import { createAdminClient } from "@/lib/supabase/admin";

const ALLOWED_DOC_MIME = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
];

const MAX_DOC_BYTES = 10 * 1024 * 1024; // 10MB

const baseSchema = z.object({
  brandId: z.string().uuid("Marca inválida"),
  fullName: z.string().trim().min(2, "Ingresá tu nombre completo").max(120),
  taxId: z
    .string()
    .trim()
    .min(8, "El RUC / CUIT debe tener al menos 8 dígitos")
    .max(20, "Máximo 20 caracteres")
    .regex(/^[0-9-]+$/, "Solo números y guiones"),
  email: z.string().trim().email("Email inválido").max(200),
  phone: z
    .string()
    .trim()
    .min(6, "Ingresá un teléfono válido")
    .max(40, "Máximo 40 caracteres"),
  subject: z.string().trim().min(1, "Elegí un asunto").max(120),
  message: z
    .string()
    .trim()
    .min(10, "Contanos un poco más sobre tu consulta")
    .max(4000, "Máximo 4000 caracteres"),
  documentReference: z.string().trim().max(200).optional().or(z.literal("")),
});

export type ContactResult = { ok: true } | { ok: false; error: string };

const GENERIC_ERROR = "No pudimos enviar tu consulta. Probá nuevamente en unos minutos.";

/**
 * Recibe el form como FormData porque incluye un archivo opcional (documento
 * que sustenta la consulta).
 */
export async function submitContactMessage(formData: FormData): Promise<ContactResult> {
  const parsed = baseSchema.safeParse({
    brandId: formData.get("brandId"),
    fullName: formData.get("fullName"),
    taxId: formData.get("taxId"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    subject: formData.get("subject"),
    message: formData.get("message"),
    documentReference: formData.get("documentReference") ?? "",
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? GENERIC_ERROR };
  }

  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? null;
  const ua = h.get("user-agent");

  const supabase = createAdminClient();

  // Subir documento si vino.
  let attachmentUrl: string | null = null;
  let attachmentName: string | null = parsed.data.documentReference?.trim() || null;
  const file = formData.get("document");
  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_DOC_BYTES) {
      return { ok: false, error: "El documento supera 10MB" };
    }
    if (!ALLOWED_DOC_MIME.includes(file.type)) {
      return {
        ok: false,
        error: "Formato no soportado. Permitidos: PDF, Word, Excel, PNG/JPG.",
      };
    }
    const ext = (file.name.match(/\.([a-z0-9]+)$/i)?.[1] ?? "bin").toLowerCase();
    const path = `${parsed.data.brandId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("contact-attachments")
      .upload(path, file, { contentType: file.type, cacheControl: "3600", upsert: false });
    if (upErr) {
      return { ok: false, error: `No pudimos subir el documento: ${upErr.message}` };
    }
    attachmentUrl = path; // guardamos el path; la URL firmada la genera el admin al ver.
    // Si el user no escribió referencia, usamos el filename como name visible.
    if (!attachmentName) attachmentName = file.name;
  }

  const { error } = await supabase.from("contact_messages").insert({
    brand_id: parsed.data.brandId,
    full_name: parsed.data.fullName,
    tax_id: parsed.data.taxId,
    email: parsed.data.email,
    phone: parsed.data.phone,
    subject: parsed.data.subject,
    message: parsed.data.message,
    attachment_url: attachmentUrl,
    attachment_name: attachmentName,
    ip_address: ip,
    user_agent: ua ?? null,
  });

  if (error) {
    return { ok: false, error: GENERIC_ERROR };
  }

  return { ok: true };
}

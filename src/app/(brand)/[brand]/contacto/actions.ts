"use server";

import { headers } from "next/headers";
import { z } from "zod";

import { createAdminClient } from "@/lib/supabase/admin";

const contactSchema = z.object({
  brandId: z.string().uuid("Marca inválida"),
  fullName: z.string().trim().min(2, "Ingresá tu nombre").max(120),
  email: z.string().trim().email("Email inválido").max(200),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  subject: z.string().trim().min(1, "Elegí un asunto").max(120),
  message: z.string().trim().min(10, "Contanos al menos un poco sobre tu consulta").max(4000),
});

export type ContactInput = z.infer<typeof contactSchema>;
export type ContactResult = { ok: true } | { ok: false; error: string };

const GENERIC_ERROR = "No pudimos enviar tu consulta. Probá nuevamente en unos minutos.";

export async function submitContactMessage(input: ContactInput): Promise<ContactResult> {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? GENERIC_ERROR };
  }

  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? null;
  const ua = h.get("user-agent");

  const supabase = createAdminClient();
  const { error } = await supabase.from("contact_messages").insert({
    brand_id: parsed.data.brandId,
    full_name: parsed.data.fullName,
    email: parsed.data.email,
    phone: parsed.data.phone?.trim() || null,
    subject: parsed.data.subject,
    message: parsed.data.message,
    ip_address: ip,
    user_agent: ua ?? null,
  });

  if (error) {
    return { ok: false, error: GENERIC_ERROR };
  }

  return { ok: true };
}

"use server";

import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const recoverSchema = z.object({
  email: z.string().email(),
});

export type RecoverPasswordInput = z.infer<typeof recoverSchema>;

export type RecoverPasswordResult = { ok: true } | { ok: false; error: string };

const INVALID_EMAIL_ERROR = "Ingresá un email válido";
const SITE_URL_MISSING_ERROR = "No pudimos procesar tu solicitud. Intentá nuevamente.";

function getSiteUrl(): string | null {
  const raw = process.env.NEXT_PUBLIC_SITE_URL;
  if (!raw) return null;
  return raw.replace(/\/+$/, "");
}

export async function requestPasswordReset(
  input: RecoverPasswordInput
): Promise<RecoverPasswordResult> {
  const parsed = recoverSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: INVALID_EMAIL_ERROR };
  }

  const siteUrl = getSiteUrl();
  if (!siteUrl) {
    return { ok: false, error: SITE_URL_MISSING_ERROR };
  }

  const supabase = await createClient();
  // No revelamos si el email existe o no para evitar enumeración de cuentas.
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${siteUrl}/auth/reset-password`,
  });

  return { ok: true };
}

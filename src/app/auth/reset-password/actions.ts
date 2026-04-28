"use server";

import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const resetSchema = z
  .object({
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .regex(/[0-9]/, "La contraseña debe incluir al menos un número"),
    password_confirm: z.string(),
  })
  .refine((data) => data.password === data.password_confirm, {
    path: ["password_confirm"],
    message: "Las contraseñas no coinciden",
  });

export type ResetPasswordInput = z.infer<typeof resetSchema>;

export type ResetPasswordResult = { ok: true } | { ok: false; error: string };

const GENERIC_ERROR = "No pudimos actualizar la contraseña. Intentá nuevamente.";
const INVALID_LINK_ERROR = "El enlace de recuperación es inválido o ya expiró. Solicitá uno nuevo.";
const WEAK_PASSWORD_ERROR = "La contraseña es demasiado débil";
const SAME_PASSWORD_ERROR = "La nueva contraseña debe ser distinta a la actual";

export async function resetPassword(input: ResetPasswordInput): Promise<ResetPasswordResult> {
  const parsed = resetSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? GENERIC_ERROR };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: INVALID_LINK_ERROR };
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });

  if (error) {
    if (error.code === "weak_password") {
      return { ok: false, error: WEAK_PASSWORD_ERROR };
    }
    if (error.code === "same_password") {
      return { ok: false, error: SAME_PASSWORD_ERROR };
    }
    return { ok: false, error: GENERIC_ERROR };
  }

  return { ok: true };
}

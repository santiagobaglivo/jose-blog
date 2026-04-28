"use server";

import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const signUpSchema = z
  .object({
    display_name: z
      .string()
      .trim()
      .min(2, "El nombre debe tener al menos 2 caracteres")
      .max(80, "El nombre no puede superar 80 caracteres"),
    email: z.string().email("Email inválido"),
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

export type SignUpInput = z.infer<typeof signUpSchema>;

export type SignUpResult = { ok: true } | { ok: false; error: string };

const GENERIC_ERROR = "No pudimos crear tu cuenta. Intentá nuevamente.";
const EMAIL_TAKEN_ERROR = "Ya existe una cuenta con ese email";
const WEAK_PASSWORD_ERROR = "La contraseña es demasiado débil";

export async function signUp(input: SignUpInput): Promise<SignUpResult> {
  const parsed = signUpSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? GENERIC_ERROR };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { display_name: parsed.data.display_name },
    },
  });

  if (error) {
    if (error.code === "weak_password") {
      return { ok: false, error: WEAK_PASSWORD_ERROR };
    }
    if (error.code === "user_already_exists" || error.code === "email_exists") {
      return { ok: false, error: EMAIL_TAKEN_ERROR };
    }
    return { ok: false, error: GENERIC_ERROR };
  }

  if (data.user && data.user.identities && data.user.identities.length === 0) {
    return { ok: false, error: EMAIL_TAKEN_ERROR };
  }

  return { ok: true };
}

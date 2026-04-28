"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  redirectedFrom: z.string().optional(),
});

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

const resetPasswordSchema = z.object({
  email: z.string().email(),
});

const updatePasswordSchema = z
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

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;

export type SignInResult = { ok: true; redirectTo: string } | { ok: false; error: string };
export type SignUpResult = { ok: true } | { ok: false; error: string };
export type SignOutResult = { ok: true } | { ok: false; error: string };
export type ResetPasswordResult = { ok: true } | { ok: false; error: string };
export type UpdatePasswordResult = { ok: true } | { ok: false; error: string };

const SIGN_IN_GENERIC_ERROR = "Email o contraseña incorrectos";
const SIGN_UP_GENERIC_ERROR = "No pudimos crear tu cuenta. Intentá nuevamente.";
const SIGN_UP_EMAIL_TAKEN_ERROR = "Ya existe una cuenta con ese email";
const WEAK_PASSWORD_ERROR = "La contraseña es demasiado débil";
const SIGN_OUT_GENERIC_ERROR = "No pudimos cerrar sesión. Intentá nuevamente.";
const RESET_INVALID_EMAIL_ERROR = "Ingresá un email válido";
const RESET_SITE_URL_MISSING_ERROR = "No pudimos procesar tu solicitud. Intentá nuevamente.";
const UPDATE_GENERIC_ERROR = "No pudimos actualizar la contraseña. Intentá nuevamente.";
const UPDATE_INVALID_LINK_ERROR =
  "El enlace de recuperación es inválido o ya expiró. Solicitá uno nuevo.";
const UPDATE_SAME_PASSWORD_ERROR = "La nueva contraseña debe ser distinta a la actual";

function safeRedirect(value: string | undefined | null): string {
  if (!value) return "/";
  if (!value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

function getSiteUrl(): string | null {
  const raw = process.env.NEXT_PUBLIC_SITE_URL;
  if (!raw) return null;
  return raw.replace(/\/+$/, "");
}

export async function signIn(input: SignInInput): Promise<SignInResult> {
  const parsed = signInSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: SIGN_IN_GENERIC_ERROR };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { ok: false, error: SIGN_IN_GENERIC_ERROR };
  }

  revalidatePath("/", "layout");
  return { ok: true, redirectTo: safeRedirect(parsed.data.redirectedFrom) };
}

export async function signUp(input: SignUpInput): Promise<SignUpResult> {
  const parsed = signUpSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? SIGN_UP_GENERIC_ERROR };
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
      return { ok: false, error: SIGN_UP_EMAIL_TAKEN_ERROR };
    }
    return { ok: false, error: SIGN_UP_GENERIC_ERROR };
  }

  // Supabase devuelve un usuario sin identidades cuando el email ya estaba registrado.
  if (data.user && data.user.identities && data.user.identities.length === 0) {
    return { ok: false, error: SIGN_UP_EMAIL_TAKEN_ERROR };
  }

  return { ok: true };
}

export async function signOut(): Promise<SignOutResult> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    return { ok: false, error: SIGN_OUT_GENERIC_ERROR };
  }

  revalidatePath("/", "layout");
  return { ok: true };
}

export async function resetPassword(input: ResetPasswordInput): Promise<ResetPasswordResult> {
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: RESET_INVALID_EMAIL_ERROR };
  }

  const siteUrl = getSiteUrl();
  if (!siteUrl) {
    return { ok: false, error: RESET_SITE_URL_MISSING_ERROR };
  }

  const supabase = await createClient();
  // No revelamos si el email existe o no para evitar enumeración de cuentas.
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${siteUrl}/auth/reset-password`,
  });

  return { ok: true };
}

export async function updatePassword(input: UpdatePasswordInput): Promise<UpdatePasswordResult> {
  const parsed = updatePasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? UPDATE_GENERIC_ERROR };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: UPDATE_INVALID_LINK_ERROR };
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });

  if (error) {
    if (error.code === "weak_password") {
      return { ok: false, error: WEAK_PASSWORD_ERROR };
    }
    if (error.code === "same_password") {
      return { ok: false, error: UPDATE_SAME_PASSWORD_ERROR };
    }
    return { ok: false, error: UPDATE_GENERIC_ERROR };
  }

  revalidatePath("/", "layout");
  return { ok: true };
}

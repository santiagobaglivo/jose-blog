"use server";

import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  redirectedFrom: z.string().optional(),
});

export type SignInInput = z.infer<typeof loginSchema>;

export type SignInResult = { ok: true; redirectTo: string } | { ok: false; error: string };

const GENERIC_ERROR = "Email o contraseña incorrectos";

function safeRedirect(value: string | undefined | null): string {
  if (!value) return "/";
  if (!value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

export async function signIn(input: SignInInput): Promise<SignInResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: GENERIC_ERROR };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { ok: false, error: GENERIC_ERROR };
  }

  return { ok: true, redirectTo: safeRedirect(parsed.data.redirectedFrom) };
}

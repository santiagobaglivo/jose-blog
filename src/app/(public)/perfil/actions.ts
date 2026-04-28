"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const updateProfileSchema = z.object({
  display_name: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(80, "El nombre no puede superar 80 caracteres"),
  bio: z
    .string()
    .trim()
    .max(500, "La descripción no puede superar 500 caracteres")
    .optional()
    .or(z.literal("")),
  avatar_url: z
    .string()
    .trim()
    .url("Debe ser una URL válida")
    .max(500, "La URL no puede superar 500 caracteres")
    .optional()
    .or(z.literal("")),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdateProfileResult = { ok: true } | { ok: false; error: string };

const UPDATE_GENERIC_ERROR = "No pudimos actualizar tu perfil. Intentá nuevamente.";
const UPDATE_UNAUTHENTICATED_ERROR = "Tu sesión expiró. Volvé a iniciar sesión.";

export async function updateProfile(input: UpdateProfileInput): Promise<UpdateProfileResult> {
  const parsed = updateProfileSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? UPDATE_GENERIC_ERROR };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: UPDATE_UNAUTHENTICATED_ERROR };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: parsed.data.display_name,
      bio: parsed.data.bio ? parsed.data.bio : null,
      avatar_url: parsed.data.avatar_url ? parsed.data.avatar_url : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    return { ok: false, error: UPDATE_GENERIC_ERROR };
  }

  revalidatePath("/perfil");
  revalidatePath("/", "layout");
  return { ok: true };
}

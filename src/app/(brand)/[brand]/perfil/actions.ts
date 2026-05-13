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
});

const avatarUrlSchema = z
  .string()
  .trim()
  .url("URL de avatar inválida")
  .max(500, "La URL no puede superar 500 caracteres")
  .nullable();

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdateProfileResult = { ok: true } | { ok: false; error: string };

const UPDATE_GENERIC_ERROR = "No pudimos actualizar tu perfil. Intentá nuevamente.";
const UPDATE_UNAUTHENTICATED_ERROR = "Tu sesión expiró. Volvé a iniciar sesión.";
const UPDATE_AVATAR_ERROR = "No pudimos actualizar tu avatar. Intentá nuevamente.";
const UPLOAD_AVATAR_ERROR = "No pudimos subir tu foto. Intentá nuevamente.";

const MAX_AVATAR_BYTES = 2 * 1024 * 1024; // 2MB
const ALLOWED_AVATAR_MIME = ["image/png", "image/jpeg", "image/jpg", "image/webp"] as const;
const MIME_TO_EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/webp": "webp",
};

export type UploadAvatarResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

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

export async function updateAvatarUrl(
  avatarUrl: string | null
): Promise<UpdateProfileResult> {
  const parsed = avatarUrlSchema.safeParse(avatarUrl);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? UPDATE_AVATAR_ERROR };
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
      avatar_url: parsed.data,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    return { ok: false, error: UPDATE_AVATAR_ERROR };
  }

  revalidatePath("/perfil");
  revalidatePath("/", "layout");
  return { ok: true };
}

// ============================================================================
// Upload de avatar del usuario al bucket `avatars`.
// La RLS del bucket exige que el path empiece con `<user_id>/`.
// ============================================================================

export async function uploadAvatar(formData: FormData): Promise<UploadAvatarResult> {
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { ok: false, error: "Archivo inválido" };
  }
  if (file.size === 0) {
    return { ok: false, error: "Archivo vacío" };
  }
  if (file.size > MAX_AVATAR_BYTES) {
    return { ok: false, error: "La imagen supera 2 MB" };
  }
  if (!ALLOWED_AVATAR_MIME.includes(file.type as (typeof ALLOWED_AVATAR_MIME)[number])) {
    return { ok: false, error: "Formato no soportado (PNG/JPG/WEBP)" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: UPDATE_UNAUTHENTICATED_ERROR };
  }

  const ext = MIME_TO_EXT[file.type] ?? "jpg";
  const path = `${user.id}/avatar-${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, file, {
      contentType: file.type,
      cacheControl: "3600",
      upsert: false,
    });
  if (uploadError) {
    return { ok: false, error: UPLOAD_AVATAR_ERROR };
  }

  const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
  const publicUrl = pub.publicUrl;

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
    .eq("id", user.id);
  if (updateError) {
    return { ok: false, error: UPDATE_AVATAR_ERROR };
  }

  revalidatePath("/perfil");
  revalidatePath("/", "layout");
  return { ok: true, url: publicUrl };
}

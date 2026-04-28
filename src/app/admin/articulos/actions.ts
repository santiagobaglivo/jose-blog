"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const createTagSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(40, "Máximo 40 caracteres"),
});

export type CreateTagInput = z.infer<typeof createTagSchema>;
export type CreatedTag = { id: string; name: string; slug: string };
export type CreateTagResult =
  | { ok: true; tag: CreatedTag }
  | { ok: false; error: string };

const GENERIC_ERROR = "No pudimos crear la etiqueta. Intentá nuevamente.";
const UNAUTHENTICATED_ERROR = "Tu sesión expiró. Volvé a iniciar sesión.";
const FORBIDDEN_ERROR = "No tenés permisos para crear etiquetas.";
const DUPLICATE_ERROR = "Ya existe una etiqueta con ese nombre.";
const INVALID_SLUG_ERROR = "El nombre debe contener al menos un carácter alfanumérico.";
const DELETE_GENERIC_ERROR = "No pudimos eliminar el artículo. Intentá nuevamente.";
const DELETE_FORBIDDEN_ERROR = "No tenés permisos para eliminar artículos.";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export async function createTag(input: CreateTagInput): Promise<CreateTagResult> {
  const parsed = createTagSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? GENERIC_ERROR };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: UNAUTHENTICATED_ERROR };
  }

  const { data: callerProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (callerProfile?.role !== "admin") {
    return { ok: false, error: FORBIDDEN_ERROR };
  }

  const name = parsed.data.name;
  const slug = slugify(name);
  if (!slug) {
    return { ok: false, error: INVALID_SLUG_ERROR };
  }

  const { data, error } = await supabase
    .from("tags")
    .insert({ name, slug })
    .select("id, name, slug")
    .single();

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: DUPLICATE_ERROR };
    }
    return { ok: false, error: GENERIC_ERROR };
  }

  revalidatePath("/admin/articulos");
  return { ok: true, tag: data };
}

const deletePostSchema = z.object({
  postId: z.string().uuid("ID de artículo inválido"),
});

export type DeletePostInput = z.infer<typeof deletePostSchema>;
export type DeletePostResult = { ok: true } | { ok: false; error: string };

export async function deletePost(input: DeletePostInput): Promise<DeletePostResult> {
  const parsed = deletePostSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? DELETE_GENERIC_ERROR };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: UNAUTHENTICATED_ERROR };
  }

  const { data: callerProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (callerProfile?.role !== "admin") {
    return { ok: false, error: DELETE_FORBIDDEN_ERROR };
  }

  const { error } = await supabase
    .from("posts")
    .update({
      deleted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.postId)
    .is("deleted_at", null);

  if (error) {
    return { ok: false, error: DELETE_GENERIC_ERROR };
  }

  revalidatePath("/admin/articulos");
  revalidatePath("/blog");
  return { ok: true };
}

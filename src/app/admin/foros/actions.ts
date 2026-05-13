"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getAdminScope } from "@/lib/auth/admin-scope";
import { createClient } from "@/lib/supabase/server";

const UNAUTH = "Tu sesión expiró. Volvé a iniciar sesión.";
const FORBIDDEN = "No tenés permisos para esta acción.";
const GENERIC = "No pudimos completar la acción.";
const DUPLICATE = "Ya existe una categoría con ese nombre en esta marca.";
const BRAND_REQUIRED =
  "Como super-admin sin marca activa necesitás indicar a qué marca pertenece.";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

// ============================================================================
// Forum categories
// ============================================================================

const upsertForumCatSchema = z.object({
  categoryId: z.string().uuid().optional(),
  brandId: z.string().uuid().optional(),
  parentId: z.string().uuid().optional().or(z.literal("")),
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(300).optional().or(z.literal("")),
  icon: z.string().trim().max(60).optional().or(z.literal("")),
});
export type UpsertForumCatInput = z.infer<typeof upsertForumCatSchema>;
export type UpsertForumCatResult = { ok: true; id: string } | { ok: false; error: string };

export async function upsertForumCategory(
  input: UpsertForumCatInput
): Promise<UpsertForumCatResult> {
  const parsed = upsertForumCatSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? GENERIC };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: UNAUTH };

  const scope = await getAdminScope();
  if (scope.kind === "none") return { ok: false, error: FORBIDDEN };
  const brandId = scope.brand?.id ?? parsed.data.brandId;
  if (!brandId) return { ok: false, error: BRAND_REQUIRED };

  const slug = slugify(parsed.data.name);
  if (!slug) return { ok: false, error: "El nombre necesita al menos un carácter alfanumérico." };

  const payload = {
    brand_id: brandId,
    parent_id: parsed.data.parentId?.trim() || null,
    slug,
    name: parsed.data.name,
    description: parsed.data.description?.trim() || null,
    icon: parsed.data.icon?.trim() || "help-circle",
    updated_at: new Date().toISOString(),
  };

  if (parsed.data.categoryId) {
    const { data, error } = await supabase
      .from("forum_categories")
      .update(payload)
      .eq("id", parsed.data.categoryId)
      .select("id")
      .single();
    if (error) {
      if (error.code === "23505") return { ok: false, error: DUPLICATE };
      return { ok: false, error: error.code === "42501" ? FORBIDDEN : GENERIC };
    }
    revalidatePath("/admin/foros");
    revalidatePath("/", "layout");
    return { ok: true, id: data.id };
  }

  const { data, error } = await supabase
    .from("forum_categories")
    .insert(payload)
    .select("id")
    .single();
  if (error) {
    if (error.code === "23505") return { ok: false, error: DUPLICATE };
    return { ok: false, error: error.code === "42501" ? FORBIDDEN : GENERIC };
  }
  revalidatePath("/admin/foros");
  revalidatePath("/", "layout");
  return { ok: true, id: data.id };
}

const deleteForumCatSchema = z.object({ categoryId: z.string().uuid() });
export type DeleteForumCatInput = z.infer<typeof deleteForumCatSchema>;
export type DeleteForumCatResult = { ok: true } | { ok: false; error: string };

export async function deleteForumCategory(
  input: DeleteForumCatInput
): Promise<DeleteForumCatResult> {
  const parsed = deleteForumCatSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: GENERIC };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: UNAUTH };

  const { error } = await supabase
    .from("forum_categories")
    .delete()
    .eq("id", parsed.data.categoryId);
  if (error) return { ok: false, error: error.code === "42501" ? FORBIDDEN : GENERIC };
  revalidatePath("/admin/foros");
  revalidatePath("/", "layout");
  return { ok: true };
}

// ============================================================================
// Thread moderation
// ============================================================================

const moderateThreadSchema = z.object({
  threadId: z.string().uuid(),
  action: z.enum(["pin", "unpin", "hide", "delete"]),
});
export type ModerateThreadInput = z.infer<typeof moderateThreadSchema>;
export type ModerateThreadResult = { ok: true } | { ok: false; error: string };

export async function moderateThread(
  input: ModerateThreadInput
): Promise<ModerateThreadResult> {
  const parsed = moderateThreadSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: GENERIC };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: UNAUTH };

  if (parsed.data.action === "pin" || parsed.data.action === "unpin") {
    const { error } = await supabase
      .from("forum_threads")
      .update({
        pinned: parsed.data.action === "pin",
        updated_at: new Date().toISOString(),
      })
      .eq("id", parsed.data.threadId);
    if (error) return { ok: false, error: error.code === "42501" ? FORBIDDEN : GENERIC };
  } else {
    // hide y delete son ambos soft-delete (set deleted_at). UI los distingue.
    const { error } = await supabase
      .from("forum_threads")
      .update({
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", parsed.data.threadId)
      .is("deleted_at", null);
    if (error) return { ok: false, error: error.code === "42501" ? FORBIDDEN : GENERIC };
  }

  revalidatePath("/admin/foros");
  revalidatePath("/", "layout");
  return { ok: true };
}

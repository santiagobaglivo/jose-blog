"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getAdminScope } from "@/lib/auth/admin-scope";
import { createClient } from "@/lib/supabase/server";

const UNAUTH = "Tu sesión expiró. Volvé a iniciar sesión.";
const FORBIDDEN = "No tenés permisos para esta acción.";
const GENERIC = "No pudimos completar la acción. Probá nuevamente.";
const DUPLICATE = "Ya existe un elemento con ese nombre en esta marca.";
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
// Categorías
// ============================================================================

const upsertCategorySchema = z.object({
  categoryId: z.string().uuid().optional(),
  brandId: z.string().uuid().optional(),
  name: z.string().trim().min(2, "Nombre muy corto").max(80),
  description: z.string().trim().max(300).optional().or(z.literal("")),
});
export type UpsertCategoryInput = z.infer<typeof upsertCategorySchema>;
export type UpsertCategoryResult = { ok: true; id: string } | { ok: false; error: string };

export async function upsertCategory(input: UpsertCategoryInput): Promise<UpsertCategoryResult> {
  const parsed = upsertCategorySchema.safeParse(input);
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
    slug,
    name: parsed.data.name,
    description: parsed.data.description?.trim() || null,
    updated_at: new Date().toISOString(),
  };

  if (parsed.data.categoryId) {
    const { data, error } = await supabase
      .from("categories")
      .update(payload)
      .eq("id", parsed.data.categoryId)
      .select("id")
      .single();
    if (error) {
      if (error.code === "23505") return { ok: false, error: DUPLICATE };
      return { ok: false, error: error.code === "42501" ? FORBIDDEN : GENERIC };
    }
    revalidatePath("/admin/categorias");
    return { ok: true, id: data.id };
  }

  const { data, error } = await supabase
    .from("categories")
    .insert(payload)
    .select("id")
    .single();
  if (error) {
    if (error.code === "23505") return { ok: false, error: DUPLICATE };
    return { ok: false, error: error.code === "42501" ? FORBIDDEN : GENERIC };
  }
  revalidatePath("/admin/categorias");
  return { ok: true, id: data.id };
}

const deleteCategorySchema = z.object({ categoryId: z.string().uuid() });
export type DeleteCategoryInput = z.infer<typeof deleteCategorySchema>;
export type DeleteCategoryResult = { ok: true } | { ok: false; error: string };

export async function deleteCategory(input: DeleteCategoryInput): Promise<DeleteCategoryResult> {
  const parsed = deleteCategorySchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: GENERIC };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: UNAUTH };

  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", parsed.data.categoryId);
  if (error) {
    // FK violation: hay posts usando la categoría.
    if (error.code === "23503") {
      return {
        ok: false,
        error: "No se puede borrar: hay artículos asignados a esta categoría.",
      };
    }
    return { ok: false, error: error.code === "42501" ? FORBIDDEN : GENERIC };
  }
  revalidatePath("/admin/categorias");
  return { ok: true };
}

// ============================================================================
// Tags
// ============================================================================

const deleteTagSchema = z.object({ tagId: z.string().uuid() });
export type DeleteTagInput = z.infer<typeof deleteTagSchema>;
export type DeleteTagResult = { ok: true } | { ok: false; error: string };

export async function deleteTag(input: DeleteTagInput): Promise<DeleteTagResult> {
  const parsed = deleteTagSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: GENERIC };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: UNAUTH };

  const { error } = await supabase.from("tags").delete().eq("id", parsed.data.tagId);
  if (error) return { ok: false, error: error.code === "42501" ? FORBIDDEN : GENERIC };
  revalidatePath("/admin/categorias");
  return { ok: true };
}

const createTagPublicSchema = z.object({
  brandId: z.string().uuid().optional(),
  name: z.string().trim().min(2).max(40),
});
export type CreateTagPublicInput = z.infer<typeof createTagPublicSchema>;
export type CreateTagPublicResult =
  | { ok: true; id: string; name: string; slug: string }
  | { ok: false; error: string };

export async function createTagInCategorias(
  input: CreateTagPublicInput
): Promise<CreateTagPublicResult> {
  const parsed = createTagPublicSchema.safeParse(input);
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

  const { data, error } = await supabase
    .from("tags")
    .insert({ brand_id: brandId, slug, name: parsed.data.name })
    .select("id, name, slug")
    .single();
  if (error) {
    if (error.code === "23505") return { ok: false, error: DUPLICATE };
    return { ok: false, error: error.code === "42501" ? FORBIDDEN : GENERIC };
  }
  revalidatePath("/admin/categorias");
  return { ok: true, id: data.id, name: data.name, slug: data.slug };
}

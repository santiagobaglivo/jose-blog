"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getAdminScope } from "@/lib/auth/admin-scope";
import { sanitizeHtml } from "@/lib/editor/sanitize";
import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/types/database";

const createTagSchema = z.object({
  brandId: z.string().uuid("Marca inválida"),
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

  const { brandId, name } = parsed.data;
  const slug = slugify(name);
  if (!slug) {
    return { ok: false, error: INVALID_SLUG_ERROR };
  }

  const { data, error } = await supabase
    .from("tags")
    .insert({ name, slug, brand_id: brandId })
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
  // El blog vive bajo /[brand]/blog. Sin saber el brand del post borrado, revalidamos
  // la raíz; los lectores verán el cambio cuando entren al dominio de la marca.
  revalidatePath("/", "layout");
  return { ok: true };
}

// ============================================================================
// Crear / editar posts
// ============================================================================

const postUpsertSchema = z.object({
  postId: z.string().uuid().optional(),
  brandId: z.string().uuid("Marca inválida").optional(),
  title: z
    .string()
    .trim()
    .min(5, "El título es muy corto")
    .max(200, "Máximo 200 caracteres"),
  subtitle: z.string().trim().max(300).optional().or(z.literal("")),
  excerpt: z
    .string()
    .trim()
    .min(10, "El extracto es muy corto")
    .max(500, "Máximo 500 caracteres"),
  contentHtml: z.string().min(1, "Falta el contenido"),
  featuredImage: z.string().url("URL de imagen inválida").optional().or(z.literal("")),
  categoryId: z.string().uuid("Categoría inválida").optional().or(z.literal("")),
  tagIds: z.array(z.string().uuid()).default([]),
  status: z.enum(["draft", "scheduled", "published"]),
  scheduledFor: z.string().datetime().optional().or(z.literal("")),
});

export type PostUpsertInput = z.infer<typeof postUpsertSchema>;
export type PostUpsertResult =
  | { ok: true; postId: string; slug: string }
  | { ok: false; error: string };

const POST_UPSERT_GENERIC = "No pudimos guardar el artículo. Probá nuevamente.";
const POST_UPSERT_BRAND_REQUIRED =
  "Como super-admin sin marca activa necesitás indicar a qué marca pertenece.";
const POST_DUPLICATE_SLUG = "Ya existe un artículo con ese título en esta marca.";

async function uniqueSlug(brandId: string, title: string, excludeId?: string): Promise<string> {
  const supabase = await createClient();
  const base = slugify(title) || `post-${Date.now()}`;
  let candidate = base;
  let suffix = 1;
  while (true) {
    const { data } = await supabase
      .from("posts")
      .select("id")
      .eq("brand_id", brandId)
      .eq("slug", candidate)
      .maybeSingle();
    if (!data || data.id === excludeId) return candidate;
    suffix += 1;
    candidate = `${base}-${suffix}`;
    if (suffix > 100) return `${base}-${Date.now()}`;
  }
}

export async function upsertPost(input: PostUpsertInput): Promise<PostUpsertResult> {
  const parsed = postUpsertSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? POST_UPSERT_GENERIC };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: UNAUTHENTICATED_ERROR };

  const scope = await getAdminScope();
  if (scope.kind === "none") return { ok: false, error: FORBIDDEN_ERROR };

  // brand_id: scope manda; si super sin scope, requerimos input.brandId.
  const brandId = scope.brand?.id ?? parsed.data.brandId;
  if (!brandId) return { ok: false, error: POST_UPSERT_BRAND_REQUIRED };

  const isUpdate = Boolean(parsed.data.postId);
  const slug = await uniqueSlug(brandId, parsed.data.title, parsed.data.postId);

  // Status timestamps
  let publishedAt: string | null = null;
  let scheduledFor: string | null = null;
  if (parsed.data.status === "published") {
    publishedAt = new Date().toISOString();
  } else if (parsed.data.status === "scheduled") {
    if (!parsed.data.scheduledFor) {
      return { ok: false, error: "Indicá fecha de publicación para programar." };
    }
    scheduledFor = parsed.data.scheduledFor;
  }

  const sanitizedHtml = sanitizeHtml(parsed.data.contentHtml);

  const payload = {
    brand_id: brandId,
    slug,
    title: parsed.data.title,
    subtitle: parsed.data.subtitle?.trim() || null,
    excerpt: parsed.data.excerpt,
    content: {} as Json, // TipTap JSON placeholder; content_html es lo que se renderiza.
    content_html: sanitizedHtml,
    featured_image: parsed.data.featuredImage?.trim() || null,
    category_id: parsed.data.categoryId?.trim() || null,
    status: parsed.data.status,
    published_at: publishedAt,
    scheduled_for: scheduledFor,
    author_id: user.id,
    read_time_minutes: Math.max(
      1,
      Math.round(sanitizedHtml.replace(/<[^>]+>/g, "").split(/\s+/).length / 220)
    ),
    updated_at: new Date().toISOString(),
  };

  let postId: string;
  if (isUpdate) {
    const { data, error } = await supabase
      .from("posts")
      .update(payload)
      .eq("id", parsed.data.postId!)
      .select("id")
      .single();
    if (error) {
      if (error.code === "23505") return { ok: false, error: POST_DUPLICATE_SLUG };
      return { ok: false, error: POST_UPSERT_GENERIC };
    }
    postId = data.id;
  } else {
    const { data, error } = await supabase
      .from("posts")
      .insert(payload)
      .select("id")
      .single();
    if (error) {
      if (error.code === "23505") return { ok: false, error: POST_DUPLICATE_SLUG };
      return { ok: false, error: POST_UPSERT_GENERIC };
    }
    postId = data.id;
  }

  // Tags: reemplazar relaciones existentes.
  await supabase.from("post_tags").delete().eq("post_id", postId);
  if (parsed.data.tagIds.length > 0) {
    await supabase
      .from("post_tags")
      .insert(parsed.data.tagIds.map((tagId) => ({ post_id: postId, tag_id: tagId })));
  }

  revalidatePath("/admin/articulos");
  revalidatePath("/admin/programados");
  revalidatePath("/", "layout");
  return { ok: true, postId, slug };
}

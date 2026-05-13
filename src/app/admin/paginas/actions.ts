"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getAdminScope } from "@/lib/auth/admin-scope";
import { sanitizeHtml } from "@/lib/editor/sanitize";
import { createClient } from "@/lib/supabase/server";

const UNAUTHENTICATED_ERROR = "Tu sesión expiró. Volvé a iniciar sesión.";
const FORBIDDEN_ERROR = "No tenés permisos para gestionar páginas.";
const PAGE_UPSERT_GENERIC = "No pudimos guardar la página. Probá nuevamente.";
const PAGE_BRAND_REQUIRED =
  "Como super-admin sin marca activa necesitás indicar a qué marca pertenece.";
const PAGE_DUPLICATE_SLUG = "Ya existe una página con ese slug en esta marca.";
const PAGE_DELETE_GENERIC = "No pudimos eliminar la página. Intentá nuevamente.";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

async function uniqueSlug(brandId: string, base: string, excludeId?: string): Promise<string> {
  const supabase = await createClient();
  let candidate = base;
  let suffix = 1;
  while (true) {
    const { data } = await supabase
      .from("brand_pages")
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

// ============================================================================
// upsertBrandPage
// ============================================================================

const upsertSchema = z.object({
  pageId: z.string().uuid().optional(),
  brandId: z.string().uuid("Marca inválida").optional(),
  title: z
    .string()
    .trim()
    .min(2, "El título es muy corto")
    .max(200, "Máximo 200 caracteres"),
  slug: z
    .string()
    .trim()
    .max(80, "Máximo 80 caracteres")
    .optional()
    .or(z.literal("")),
  subtitle: z.string().trim().max(300).optional().or(z.literal("")),
  contentHtml: z.string().default(""),
  heroImage: z.string().url("URL inválida").optional().or(z.literal("")),
  showInMenu: z.boolean().default(true),
  menuOrder: z.number().int().min(0).max(9999).default(0),
  status: z.enum(["draft", "published", "archived"]).default("published"),
  seoTitle: z.string().trim().max(200).optional().or(z.literal("")),
  seoDescription: z.string().trim().max(500).optional().or(z.literal("")),
});

export type BrandPageUpsertInput = z.infer<typeof upsertSchema>;
export type BrandPageUpsertResult =
  | { ok: true; pageId: string; slug: string }
  | { ok: false; error: string };

export async function upsertBrandPage(
  input: BrandPageUpsertInput
): Promise<BrandPageUpsertResult> {
  const parsed = upsertSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? PAGE_UPSERT_GENERIC };
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
  if (!brandId) return { ok: false, error: PAGE_BRAND_REQUIRED };

  // Admin local solo puede tocar su brand (defensa en profundidad sobre RLS).
  if (scope.kind === "local" && scope.brand && brandId !== scope.brand.id) {
    return { ok: false, error: FORBIDDEN_ERROR };
  }

  const isUpdate = Boolean(parsed.data.pageId);
  const slugBase = slugify(parsed.data.slug || parsed.data.title) || `pagina-${Date.now()}`;
  const slug = await uniqueSlug(brandId, slugBase, parsed.data.pageId);

  const sanitizedHtml = sanitizeHtml(parsed.data.contentHtml || "");

  const payload = {
    brand_id: brandId,
    slug,
    title: parsed.data.title,
    subtitle: parsed.data.subtitle?.trim() || null,
    content_html: sanitizedHtml,
    hero_image: parsed.data.heroImage?.trim() || null,
    show_in_menu: parsed.data.showInMenu,
    menu_order: parsed.data.menuOrder,
    status: parsed.data.status,
    seo_title: parsed.data.seoTitle?.trim() || null,
    seo_description: parsed.data.seoDescription?.trim() || null,
    updated_at: new Date().toISOString(),
  };

  let pageId: string;
  if (isUpdate) {
    const { data, error } = await supabase
      .from("brand_pages")
      .update(payload)
      .eq("id", parsed.data.pageId!)
      .select("id")
      .single();
    if (error) {
      if (error.code === "23505") return { ok: false, error: PAGE_DUPLICATE_SLUG };
      return { ok: false, error: PAGE_UPSERT_GENERIC };
    }
    pageId = data.id;
  } else {
    const { data, error } = await supabase
      .from("brand_pages")
      .insert(payload)
      .select("id")
      .single();
    if (error) {
      if (error.code === "23505") return { ok: false, error: PAGE_DUPLICATE_SLUG };
      return { ok: false, error: PAGE_UPSERT_GENERIC };
    }
    pageId = data.id;
  }

  revalidatePath("/admin/paginas");
  // La página pública vive bajo /[brand]/p/[slug]; revalidamos el layout entero
  // para refrescar el nav de la brand (que lista páginas de menú).
  revalidatePath("/", "layout");
  return { ok: true, pageId, slug };
}

// ============================================================================
// deleteBrandPage (soft delete)
// ============================================================================

const deleteSchema = z.object({
  pageId: z.string().uuid("ID de página inválido"),
});

export type DeleteBrandPageInput = z.infer<typeof deleteSchema>;
export type DeleteBrandPageResult = { ok: true } | { ok: false; error: string };

export async function deleteBrandPage(
  input: DeleteBrandPageInput
): Promise<DeleteBrandPageResult> {
  const parsed = deleteSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? PAGE_DELETE_GENERIC };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: UNAUTHENTICATED_ERROR };

  const scope = await getAdminScope();
  if (scope.kind === "none") return { ok: false, error: FORBIDDEN_ERROR };

  // Si admin local, verificar que la página sea de su brand.
  if (scope.kind === "local" && scope.brand) {
    const { data: page } = await supabase
      .from("brand_pages")
      .select("brand_id")
      .eq("id", parsed.data.pageId)
      .maybeSingle();
    if (!page || page.brand_id !== scope.brand.id) {
      return { ok: false, error: FORBIDDEN_ERROR };
    }
  }

  const { error } = await supabase
    .from("brand_pages")
    .update({
      deleted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.pageId)
    .is("deleted_at", null);

  if (error) return { ok: false, error: PAGE_DELETE_GENERIC };

  revalidatePath("/admin/paginas");
  revalidatePath("/", "layout");
  return { ok: true };
}

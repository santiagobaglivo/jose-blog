"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { invalidateBrandDomainsCache } from "@/lib/brand-domains";
import { createClient } from "@/lib/supabase/server";
import { brandSchema, type BrandInput } from "@/lib/validators/brand";

const GENERIC_ERROR = "No pudimos guardar la marca. Intentá nuevamente.";
const UNAUTHENTICATED_ERROR = "Tu sesión expiró. Volvé a iniciar sesión.";
const FORBIDDEN_ERROR = "No tenés permisos para gestionar marcas.";
const DUPLICATE_SLUG_ERROR = "Ya existe una marca con ese slug.";
const DUPLICATE_DOMAIN_ERROR = "Ese dominio ya está asignado a otra marca.";
const NOT_FOUND_ERROR = "La marca no existe o fue eliminada.";

export type BrandActionResult =
  | { ok: true; id: string; slug: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export type SimpleResult = { ok: true } | { ok: false; error: string };

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: UNAUTHENTICATED_ERROR };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    return { ok: false as const, error: FORBIDDEN_ERROR };
  }
  return { ok: true as const, supabase };
}

function fieldErrorsFromZod(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".");
    if (key && !out[key]) out[key] = issue.message;
  }
  return out;
}

type BrandRow = Omit<BrandInput, "services">;

// Campos opcionales que Zod resuelve como `undefined` cuando viene string vacío
// pero que deben persistir como `null` en la DB (text nullable).
type NullableTextKey =
  | "domain"
  | "tagline"
  | "hero_image"
  | "asesoria_text"
  | "accent_color"
  | "seo_title"
  | "seo_description"
  | "whatsapp_number"
  | "contact_email"
  | "instagram_url"
  | "facebook_url"
  | "tiktok_url"
  | "linkedin_url"
  | "twitter_url";

const NULLABLE_TEXT_FIELDS: readonly NullableTextKey[] = [
  "domain",
  "tagline",
  "hero_image",
  "asesoria_text",
  "accent_color",
  "seo_title",
  "seo_description",
  "whatsapp_number",
  "contact_email",
  "instagram_url",
  "facebook_url",
  "tiktok_url",
  "linkedin_url",
  "twitter_url",
];

type NormalizedBrandRow = Omit<BrandRow, NullableTextKey> & {
  [K in NullableTextKey]: string | null;
};

/** Reemplaza `undefined` por `null` en los campos opcionales de texto antes del upsert. */
function normalizeBrandRow(row: BrandRow): NormalizedBrandRow {
  const out = { ...row } as NormalizedBrandRow;
  for (const key of NULLABLE_TEXT_FIELDS) {
    if (out[key] === undefined) out[key] = null;
  }
  return out;
}

function revalidateBrand(slug?: string) {
  revalidatePath("/admin/marcas");
  revalidatePath("/");
  if (slug) {
    revalidatePath(`/${slug}`);
    revalidatePath(`/${slug}/blog`);
  }
  // El proxy resuelve host→marca con caché in-memory; invalidar tras cualquier
  // cambio en brands (alta, edición de domain, soft delete, toggle).
  invalidateBrandDomainsCache();
}

export async function createBrand(input: BrandInput): Promise<BrandActionResult> {
  const parsed = brandSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Revisá los campos marcados.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }

  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };

  const { supabase } = auth;
  const { services, ...brandRow } = parsed.data;

  const { data: brand, error: insertErr } = await supabase
    .from("brands")
    .insert(normalizeBrandRow(brandRow))
    .select("id, slug")
    .single();

  if (insertErr || !brand) {
    if (insertErr?.code === "23505") {
      if ((insertErr.message ?? "").toLowerCase().includes("domain")) {
        return {
          ok: false,
          error: DUPLICATE_DOMAIN_ERROR,
          fieldErrors: { domain: DUPLICATE_DOMAIN_ERROR },
        };
      }
      return { ok: false, error: DUPLICATE_SLUG_ERROR, fieldErrors: { slug: DUPLICATE_SLUG_ERROR } };
    }
    return { ok: false, error: GENERIC_ERROR };
  }

  if (services.length > 0) {
    const rows = services.map((s, i) => ({
      brand_id: brand.id,
      name: s.name,
      description: s.description ?? null,
      icon: s.icon ?? null,
      image_url: s.image_url ?? null,
      display_order: s.display_order ?? i,
      is_active: s.is_active ?? true,
    }));
    const { error: svcErr } = await supabase.from("brand_services").insert(rows);
    if (svcErr) {
      // marca creada pero servicios fallaron — informar y dejar al admin reintentarlos
      revalidateBrand(brand.slug);
      return {
        ok: false,
        error: "La marca se creó pero hubo un error con los servicios. Reabrila y guardá de nuevo.",
      };
    }
  }

  revalidateBrand(brand.slug);
  return { ok: true, id: brand.id, slug: brand.slug };
}

export async function updateBrand(
  brandId: string,
  input: BrandInput
): Promise<BrandActionResult> {
  if (!z.string().uuid().safeParse(brandId).success) {
    return { ok: false, error: "ID de marca inválido" };
  }

  const parsed = brandSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Revisá los campos marcados.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }

  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };

  const { supabase } = auth;
  const { services, ...brandRow } = parsed.data;

  const { data: existing } = await supabase
    .from("brands")
    .select("slug")
    .eq("id", brandId)
    .is("deleted_at", null)
    .maybeSingle();
  if (!existing) return { ok: false, error: NOT_FOUND_ERROR };

  const { data: updated, error: updErr } = await supabase
    .from("brands")
    .update({ ...normalizeBrandRow(brandRow), updated_at: new Date().toISOString() })
    .eq("id", brandId)
    .select("id, slug")
    .single();

  if (updErr || !updated) {
    if (updErr?.code === "23505") {
      if ((updErr.message ?? "").toLowerCase().includes("domain")) {
        return {
          ok: false,
          error: DUPLICATE_DOMAIN_ERROR,
          fieldErrors: { domain: DUPLICATE_DOMAIN_ERROR },
        };
      }
      return { ok: false, error: DUPLICATE_SLUG_ERROR, fieldErrors: { slug: DUPLICATE_SLUG_ERROR } };
    }
    return { ok: false, error: GENERIC_ERROR };
  }

  // Reemplazo total de servicios: borrar e insertar.
  // Tabla chica (~30 filas por marca), no requiere diff fino.
  const { error: delErr } = await supabase
    .from("brand_services")
    .delete()
    .eq("brand_id", brandId);

  if (delErr) return { ok: false, error: GENERIC_ERROR };

  if (services.length > 0) {
    const rows = services.map((s, i) => ({
      brand_id: brandId,
      name: s.name,
      description: s.description ?? null,
      icon: s.icon ?? null,
      image_url: s.image_url ?? null,
      display_order: s.display_order ?? i,
      is_active: s.is_active ?? true,
    }));
    const { error: insErr } = await supabase.from("brand_services").insert(rows);
    if (insErr) return { ok: false, error: GENERIC_ERROR };
  }

  revalidateBrand(updated.slug);
  if (existing.slug !== updated.slug) revalidateBrand(existing.slug);

  return { ok: true, id: updated.id, slug: updated.slug };
}

export async function deleteBrand(brandId: string): Promise<SimpleResult> {
  if (!z.string().uuid().safeParse(brandId).success) {
    return { ok: false, error: "ID de marca inválido" };
  }

  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };

  const { supabase } = auth;

  const { data: brand } = await supabase
    .from("brands")
    .select("slug")
    .eq("id", brandId)
    .is("deleted_at", null)
    .maybeSingle();
  if (!brand) return { ok: false, error: NOT_FOUND_ERROR };

  const { error } = await supabase
    .from("brands")
    .update({
      deleted_at: new Date().toISOString(),
      is_active: false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", brandId);

  if (error) return { ok: false, error: GENERIC_ERROR };

  revalidateBrand(brand.slug);
  return { ok: true };
}

export async function toggleBrandActive(
  brandId: string,
  isActive: boolean
): Promise<SimpleResult> {
  if (!z.string().uuid().safeParse(brandId).success) {
    return { ok: false, error: "ID de marca inválido" };
  }

  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };

  const { supabase } = auth;

  const { data: brand, error } = await supabase
    .from("brands")
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq("id", brandId)
    .is("deleted_at", null)
    .select("slug")
    .single();

  if (error || !brand) return { ok: false, error: GENERIC_ERROR };

  revalidateBrand(brand.slug);
  return { ok: true };
}

// ============================================================================
// Upload de imagen (logo / hero) de una marca al bucket brand-assets.
// ============================================================================

const MAX_LOGO_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/svg+xml"];

export type UploadLogoResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

export async function uploadBrandLogo(formData: FormData): Promise<UploadLogoResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };

  const brandId = String(formData.get("brandId") ?? "");
  const file = formData.get("file");
  if (!brandId || !(file instanceof File)) {
    return { ok: false, error: "Datos inválidos" };
  }
  if (file.size === 0) return { ok: false, error: "Archivo vacío" };
  if (file.size > MAX_LOGO_BYTES) {
    return { ok: false, error: "La imagen supera 5MB" };
  }
  if (!ALLOWED_MIME.includes(file.type)) {
    return { ok: false, error: "Formato no soportado (PNG/JPG/WEBP/SVG)" };
  }

  const supabase = await createClient();

  const { data: brand } = await supabase
    .from("brands")
    .select("slug")
    .eq("id", brandId)
    .maybeSingle();
  if (!brand) return { ok: false, error: NOT_FOUND_ERROR };

  // Extension limpia.
  const ext = (file.name.match(/\.([a-z0-9]+)$/i)?.[1] ?? "png").toLowerCase();
  const path = `${brand.slug}/logo-${Date.now()}.${ext}`;

  const { error: upErr } = await supabase.storage
    .from("brand-assets")
    .upload(path, file, {
      contentType: file.type,
      cacheControl: "3600",
      upsert: false,
    });
  if (upErr) {
    return { ok: false, error: `No pudimos subir la imagen: ${upErr.message}` };
  }

  const { data: pub } = supabase.storage.from("brand-assets").getPublicUrl(path);
  const publicUrl = pub.publicUrl;

  // Persistir en la columna hero_image.
  const { error: updErr } = await supabase
    .from("brands")
    .update({ hero_image: publicUrl, updated_at: new Date().toISOString() })
    .eq("id", brandId);
  if (updErr) {
    return { ok: false, error: GENERIC_ERROR };
  }

  revalidateBrand(brand.slug);
  return { ok: true, url: publicUrl };
}

// ============================================================================
// Upload de imagen de un brand_service. Devuelve la URL pública; la persistencia
// del campo image_url en la fila del servicio ocurre al guardar la marca
// (services se replace-totalmente desde el form padre).
// ============================================================================

const MAX_SERVICE_IMG_BYTES = 5 * 1024 * 1024; // 5MB

export type UploadServiceImageResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

export async function uploadBrandServiceImage(
  formData: FormData
): Promise<UploadServiceImageResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };

  const brandId = String(formData.get("brandId") ?? "");
  const file = formData.get("file");
  if (!brandId || !(file instanceof File)) {
    return { ok: false, error: "Datos inválidos" };
  }
  if (file.size === 0) return { ok: false, error: "Archivo vacío" };
  if (file.size > MAX_SERVICE_IMG_BYTES) {
    return { ok: false, error: "La imagen supera 5MB" };
  }
  if (!ALLOWED_MIME.includes(file.type)) {
    return { ok: false, error: "Formato no soportado (PNG/JPG/WEBP/SVG)" };
  }

  const supabase = await createClient();

  const { data: brand } = await supabase
    .from("brands")
    .select("slug")
    .eq("id", brandId)
    .maybeSingle();
  if (!brand) return { ok: false, error: NOT_FOUND_ERROR };

  const ext = (file.name.match(/\.([a-z0-9]+)$/i)?.[1] ?? "png").toLowerCase();
  const path = `${brand.slug}/services/${Date.now()}.${ext}`;

  const { error: upErr } = await supabase.storage
    .from("brand-assets")
    .upload(path, file, {
      contentType: file.type,
      cacheControl: "3600",
      upsert: false,
    });
  if (upErr) {
    return { ok: false, error: `No pudimos subir la imagen: ${upErr.message}` };
  }

  const { data: pub } = supabase.storage.from("brand-assets").getPublicUrl(path);
  return { ok: true, url: pub.publicUrl };
}

// ============================================================================
// Brand slides: carrusel de portada editable por la admin de la brand.
// ============================================================================

const slideSchema = z.object({
  id: z.string().uuid().optional(),
  brand_id: z.string().uuid(),
  title: z
    .string()
    .trim()
    .min(2, "El título debe tener al menos 2 caracteres")
    .max(200, "Máximo 200 caracteres"),
  subtitle: z
    .string()
    .trim()
    .max(400, "Máximo 400 caracteres")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  image_url: z
    .string()
    .trim()
    .url("URL inválida")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  cta_label: z
    .string()
    .trim()
    .max(80, "Máximo 80 caracteres")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  cta_href: z
    .string()
    .trim()
    .max(500, "Máximo 500 caracteres")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  display_order: z.number().int().min(0).default(0),
  is_active: z.boolean().default(true),
});

export type SlideUpsertResult =
  | { ok: true; id: string; image_url: string | null }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

const MAX_SLIDE_IMG_BYTES = 5 * 1024 * 1024; // 5MB

/**
 * Verifica que el caller pueda gestionar la brand (super o admin local de la propia brand).
 * Aprovecha is_admin_of via RLS: hacemos una lectura controlada y delegamos la barrera
 * real a las policies de brand_slides (USING is_admin_of(brand_id)).
 */
async function requireBrandAdmin(brandId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: UNAUTHENTICATED_ERROR };

  // Validamos rol mínimo (admin local o super) — la RLS de brand_slides verifica que sea
  // de SU brand al ejecutar el insert/update/delete.
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, brand_id")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile || (profile.role !== "admin" && profile.role !== "superadmin")) {
    return { ok: false as const, error: FORBIDDEN_ERROR };
  }
  if (profile.role === "admin" && profile.brand_id !== brandId) {
    return { ok: false as const, error: FORBIDDEN_ERROR };
  }
  return { ok: true as const, supabase };
}

async function getBrandSlug(supabase: Awaited<ReturnType<typeof createClient>>, brandId: string) {
  const { data } = await supabase
    .from("brands")
    .select("slug")
    .eq("id", brandId)
    .maybeSingle();
  return data?.slug ?? null;
}

export async function upsertBrandSlide(formData: FormData): Promise<SlideUpsertResult> {
  const rawId = String(formData.get("id") ?? "").trim();
  const brandId = String(formData.get("brand_id") ?? "").trim();
  if (!z.string().uuid().safeParse(brandId).success) {
    return { ok: false, error: "ID de marca inválido" };
  }

  const auth = await requireBrandAdmin(brandId);
  if (!auth.ok) return { ok: false, error: auth.error };
  const { supabase } = auth;

  const isActiveRaw = formData.get("is_active");
  const displayOrderRaw = formData.get("display_order");

  const parseResult = slideSchema.safeParse({
    id: rawId || undefined,
    brand_id: brandId,
    title: String(formData.get("title") ?? ""),
    subtitle: String(formData.get("subtitle") ?? ""),
    image_url: String(formData.get("image_url") ?? ""),
    cta_label: String(formData.get("cta_label") ?? ""),
    cta_href: String(formData.get("cta_href") ?? ""),
    display_order: displayOrderRaw == null ? 0 : Number(displayOrderRaw),
    is_active: isActiveRaw == null ? true : isActiveRaw === "true" || isActiveRaw === "on",
  });

  if (!parseResult.success) {
    return {
      ok: false,
      error: "Revisá los campos marcados.",
      fieldErrors: fieldErrorsFromZod(parseResult.error),
    };
  }

  const slug = await getBrandSlug(supabase, brandId);
  if (!slug) return { ok: false, error: NOT_FOUND_ERROR };

  let imageUrl: string | null = parseResult.data.image_url ?? null;

  // Si vino un archivo, lo subimos y reemplazamos la URL.
  const file = formData.get("file");
  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_SLIDE_IMG_BYTES) {
      return { ok: false, error: "La imagen supera 5MB" };
    }
    if (!ALLOWED_MIME.includes(file.type)) {
      return { ok: false, error: "Formato no soportado (PNG/JPG/WEBP/SVG)" };
    }
    const ext = (file.name.match(/\.([a-z0-9]+)$/i)?.[1] ?? "png").toLowerCase();
    const path = `${slug}/slides/${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("brand-assets")
      .upload(path, file, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: false,
      });
    if (upErr) {
      return { ok: false, error: `No pudimos subir la imagen: ${upErr.message}` };
    }
    const { data: pub } = supabase.storage.from("brand-assets").getPublicUrl(path);
    imageUrl = pub.publicUrl;
  }

  const payload = {
    brand_id: brandId,
    title: parseResult.data.title,
    subtitle: parseResult.data.subtitle ?? null,
    image_url: imageUrl,
    cta_label: parseResult.data.cta_label ?? null,
    cta_href: parseResult.data.cta_href ?? null,
    display_order: parseResult.data.display_order,
    is_active: parseResult.data.is_active,
  };

  if (parseResult.data.id) {
    const { data, error } = await supabase
      .from("brand_slides")
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq("id", parseResult.data.id)
      .eq("brand_id", brandId)
      .select("id, image_url")
      .maybeSingle();
    if (error || !data) {
      return { ok: false, error: GENERIC_ERROR };
    }
    revalidateBrand(slug);
    return { ok: true, id: data.id, image_url: data.image_url };
  }

  const { data, error } = await supabase
    .from("brand_slides")
    .insert(payload)
    .select("id, image_url")
    .maybeSingle();
  if (error || !data) {
    return { ok: false, error: GENERIC_ERROR };
  }
  revalidateBrand(slug);
  return { ok: true, id: data.id, image_url: data.image_url };
}

export async function deleteBrandSlide(slideId: string): Promise<SimpleResult> {
  if (!z.string().uuid().safeParse(slideId).success) {
    return { ok: false, error: "ID de slide inválido" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: UNAUTHENTICATED_ERROR };

  // Resolvemos brand_id del slide antes de chequear permisos.
  const { data: slide } = await supabase
    .from("brand_slides")
    .select("brand_id")
    .eq("id", slideId)
    .maybeSingle();
  if (!slide) return { ok: false, error: NOT_FOUND_ERROR };

  const auth = await requireBrandAdmin(slide.brand_id);
  if (!auth.ok) return { ok: false, error: auth.error };

  const slug = await getBrandSlug(auth.supabase, slide.brand_id);

  const { error } = await auth.supabase.from("brand_slides").delete().eq("id", slideId);
  if (error) return { ok: false, error: GENERIC_ERROR };

  if (slug) revalidateBrand(slug);
  return { ok: true };
}

// ============================================================================
// Brand stats: cifras/contadores editables ("+14K colaboradores", "37 años", etc.)
// ============================================================================

const statSchema = z.object({
  id: z.string().uuid().optional(),
  brand_id: z.string().uuid(),
  label: z
    .string()
    .trim()
    .min(2, "El label debe tener al menos 2 caracteres")
    .max(100, "Máximo 100 caracteres"),
  value: z
    .string()
    .trim()
    .min(1, "El valor es obligatorio")
    .max(30, "Máximo 30 caracteres"),
  suffix: z
    .string()
    .trim()
    .max(20, "Máximo 20 caracteres")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  display_order: z.number().int().min(0).default(0),
  is_active: z.boolean().default(true),
});

export type StatUpsertResult =
  | { ok: true; id: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export async function upsertBrandStat(formData: FormData): Promise<StatUpsertResult> {
  const rawId = String(formData.get("id") ?? "").trim();
  const brandId = String(formData.get("brand_id") ?? "").trim();
  if (!z.string().uuid().safeParse(brandId).success) {
    return { ok: false, error: "ID de marca inválido" };
  }

  const auth = await requireBrandAdmin(brandId);
  if (!auth.ok) return { ok: false, error: auth.error };
  const { supabase } = auth;

  const isActiveRaw = formData.get("is_active");
  const displayOrderRaw = formData.get("display_order");

  const parseResult = statSchema.safeParse({
    id: rawId || undefined,
    brand_id: brandId,
    label: String(formData.get("label") ?? ""),
    value: String(formData.get("value") ?? ""),
    suffix: String(formData.get("suffix") ?? ""),
    display_order: displayOrderRaw == null ? 0 : Number(displayOrderRaw),
    is_active: isActiveRaw == null ? true : isActiveRaw === "true" || isActiveRaw === "on",
  });

  if (!parseResult.success) {
    return {
      ok: false,
      error: "Revisá los campos marcados.",
      fieldErrors: fieldErrorsFromZod(parseResult.error),
    };
  }

  const slug = await getBrandSlug(supabase, brandId);
  if (!slug) return { ok: false, error: NOT_FOUND_ERROR };

  const payload = {
    brand_id: brandId,
    label: parseResult.data.label,
    value: parseResult.data.value,
    suffix: parseResult.data.suffix ?? null,
    display_order: parseResult.data.display_order,
    is_active: parseResult.data.is_active,
  };

  if (parseResult.data.id) {
    const { data, error } = await supabase
      .from("brand_stats")
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq("id", parseResult.data.id)
      .eq("brand_id", brandId)
      .select("id")
      .maybeSingle();
    if (error || !data) {
      return { ok: false, error: GENERIC_ERROR };
    }
    revalidateBrand(slug);
    return { ok: true, id: data.id };
  }

  const { data, error } = await supabase
    .from("brand_stats")
    .insert(payload)
    .select("id")
    .maybeSingle();
  if (error || !data) {
    return { ok: false, error: GENERIC_ERROR };
  }
  revalidateBrand(slug);
  return { ok: true, id: data.id };
}

export async function deleteBrandStat(statId: string): Promise<SimpleResult> {
  if (!z.string().uuid().safeParse(statId).success) {
    return { ok: false, error: "ID de cifra inválido" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: UNAUTHENTICATED_ERROR };

  const { data: stat } = await supabase
    .from("brand_stats")
    .select("brand_id")
    .eq("id", statId)
    .maybeSingle();
  if (!stat) return { ok: false, error: NOT_FOUND_ERROR };

  const auth = await requireBrandAdmin(stat.brand_id);
  if (!auth.ok) return { ok: false, error: auth.error };

  const slug = await getBrandSlug(auth.supabase, stat.brand_id);

  const { error } = await auth.supabase.from("brand_stats").delete().eq("id", statId);
  if (error) return { ok: false, error: GENERIC_ERROR };

  if (slug) revalidateBrand(slug);
  return { ok: true };
}

// ============================================================================
// Brand team: miembros del equipo profesional editables por la admin de la brand.
// ============================================================================

const teamMemberSchema = z.object({
  id: z.string().uuid().optional(),
  brand_id: z.string().uuid(),
  member_name: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(120, "Máximo 120 caracteres"),
  role: z
    .string()
    .trim()
    .min(2, "El cargo debe tener al menos 2 caracteres")
    .max(120, "Máximo 120 caracteres"),
  photo_url: z
    .string()
    .trim()
    .url("URL inválida")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  bio: z
    .string()
    .trim()
    .max(800, "Máximo 800 caracteres")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  display_order: z.number().int().min(0).default(0),
  is_active: z.boolean().default(true),
});

export type TeamMemberUpsertResult =
  | { ok: true; id: string; photo_url: string | null }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

const MAX_TEAM_PHOTO_BYTES = 5 * 1024 * 1024; // 5MB

export async function upsertBrandTeamMember(
  formData: FormData
): Promise<TeamMemberUpsertResult> {
  const rawId = String(formData.get("id") ?? "").trim();
  const brandId = String(formData.get("brand_id") ?? "").trim();
  if (!z.string().uuid().safeParse(brandId).success) {
    return { ok: false, error: "ID de marca inválido" };
  }

  const auth = await requireBrandAdmin(brandId);
  if (!auth.ok) return { ok: false, error: auth.error };
  const { supabase } = auth;

  const isActiveRaw = formData.get("is_active");
  const displayOrderRaw = formData.get("display_order");

  const parseResult = teamMemberSchema.safeParse({
    id: rawId || undefined,
    brand_id: brandId,
    member_name: String(formData.get("member_name") ?? ""),
    role: String(formData.get("role") ?? ""),
    photo_url: String(formData.get("photo_url") ?? ""),
    bio: String(formData.get("bio") ?? ""),
    display_order: displayOrderRaw == null ? 0 : Number(displayOrderRaw),
    is_active: isActiveRaw == null ? true : isActiveRaw === "true" || isActiveRaw === "on",
  });

  if (!parseResult.success) {
    return {
      ok: false,
      error: "Revisá los campos marcados.",
      fieldErrors: fieldErrorsFromZod(parseResult.error),
    };
  }

  const slug = await getBrandSlug(supabase, brandId);
  if (!slug) return { ok: false, error: NOT_FOUND_ERROR };

  let photoUrl: string | null = parseResult.data.photo_url ?? null;

  // Si vino un archivo, lo subimos y reemplazamos la URL.
  const file = formData.get("file");
  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_TEAM_PHOTO_BYTES) {
      return { ok: false, error: "La imagen supera 5MB" };
    }
    if (!ALLOWED_MIME.includes(file.type)) {
      return { ok: false, error: "Formato no soportado (PNG/JPG/WEBP/SVG)" };
    }
    const ext = (file.name.match(/\.([a-z0-9]+)$/i)?.[1] ?? "png").toLowerCase();
    const path = `${slug}/team/${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("brand-assets")
      .upload(path, file, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: false,
      });
    if (upErr) {
      return { ok: false, error: `No pudimos subir la imagen: ${upErr.message}` };
    }
    const { data: pub } = supabase.storage.from("brand-assets").getPublicUrl(path);
    photoUrl = pub.publicUrl;
  }

  const payload = {
    brand_id: brandId,
    member_name: parseResult.data.member_name,
    role: parseResult.data.role,
    photo_url: photoUrl,
    bio: parseResult.data.bio ?? null,
    display_order: parseResult.data.display_order,
    is_active: parseResult.data.is_active,
  };

  if (parseResult.data.id) {
    const { data, error } = await supabase
      .from("brand_team")
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq("id", parseResult.data.id)
      .eq("brand_id", brandId)
      .select("id, photo_url")
      .maybeSingle();
    if (error || !data) {
      return { ok: false, error: GENERIC_ERROR };
    }
    revalidateBrand(slug);
    return { ok: true, id: data.id, photo_url: data.photo_url };
  }

  const { data, error } = await supabase
    .from("brand_team")
    .insert(payload)
    .select("id, photo_url")
    .maybeSingle();
  if (error || !data) {
    return { ok: false, error: GENERIC_ERROR };
  }
  revalidateBrand(slug);
  return { ok: true, id: data.id, photo_url: data.photo_url };
}

export async function deleteBrandTeamMember(memberId: string): Promise<SimpleResult> {
  if (!z.string().uuid().safeParse(memberId).success) {
    return { ok: false, error: "ID de miembro inválido" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: UNAUTHENTICATED_ERROR };

  const { data: member } = await supabase
    .from("brand_team")
    .select("brand_id")
    .eq("id", memberId)
    .maybeSingle();
  if (!member) return { ok: false, error: NOT_FOUND_ERROR };

  const auth = await requireBrandAdmin(member.brand_id);
  if (!auth.ok) return { ok: false, error: auth.error };

  const slug = await getBrandSlug(auth.supabase, member.brand_id);

  const { error } = await auth.supabase.from("brand_team").delete().eq("id", memberId);
  if (error) return { ok: false, error: GENERIC_ERROR };

  if (slug) revalidateBrand(slug);
  return { ok: true };
}

// ============================================================================
// Brand testimonials: testimonios de clientes editables por la admin de la brand.
// ============================================================================

const testimonialSchema = z.object({
  id: z.string().uuid().optional(),
  brand_id: z.string().uuid(),
  author_name: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(120, "Máximo 120 caracteres"),
  author_role: z
    .string()
    .trim()
    .max(120, "Máximo 120 caracteres")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  author_company: z
    .string()
    .trim()
    .max(120, "Máximo 120 caracteres")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  author_photo_url: z
    .string()
    .trim()
    .url("URL inválida")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  quote: z
    .string()
    .trim()
    .min(10, "El testimonio debe tener al menos 10 caracteres")
    .max(1000, "Máximo 1000 caracteres"),
  rating: z
    .number()
    .int()
    .min(1, "Mínimo 1")
    .max(5, "Máximo 5")
    .optional(),
  display_order: z.number().int().min(0).default(0),
  is_active: z.boolean().default(true),
});

export type TestimonialUpsertResult =
  | { ok: true; id: string; author_photo_url: string | null }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

const MAX_TESTIMONIAL_PHOTO_BYTES = 5 * 1024 * 1024; // 5MB

export async function upsertBrandTestimonial(
  formData: FormData
): Promise<TestimonialUpsertResult> {
  const rawId = String(formData.get("id") ?? "").trim();
  const brandId = String(formData.get("brand_id") ?? "").trim();
  if (!z.string().uuid().safeParse(brandId).success) {
    return { ok: false, error: "ID de marca inválido" };
  }

  const auth = await requireBrandAdmin(brandId);
  if (!auth.ok) return { ok: false, error: auth.error };
  const { supabase } = auth;

  const isActiveRaw = formData.get("is_active");
  const displayOrderRaw = formData.get("display_order");
  const ratingRaw = formData.get("rating");
  const ratingNum = ratingRaw == null || ratingRaw === "" ? undefined : Number(ratingRaw);

  const parseResult = testimonialSchema.safeParse({
    id: rawId || undefined,
    brand_id: brandId,
    author_name: String(formData.get("author_name") ?? ""),
    author_role: String(formData.get("author_role") ?? ""),
    author_company: String(formData.get("author_company") ?? ""),
    author_photo_url: String(formData.get("author_photo_url") ?? ""),
    quote: String(formData.get("quote") ?? ""),
    rating: ratingNum,
    display_order: displayOrderRaw == null ? 0 : Number(displayOrderRaw),
    is_active: isActiveRaw == null ? true : isActiveRaw === "true" || isActiveRaw === "on",
  });

  if (!parseResult.success) {
    return {
      ok: false,
      error: "Revisá los campos marcados.",
      fieldErrors: fieldErrorsFromZod(parseResult.error),
    };
  }

  const slug = await getBrandSlug(supabase, brandId);
  if (!slug) return { ok: false, error: NOT_FOUND_ERROR };

  let photoUrl: string | null = parseResult.data.author_photo_url ?? null;

  // Si vino un archivo, lo subimos y reemplazamos la URL.
  const file = formData.get("file");
  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_TESTIMONIAL_PHOTO_BYTES) {
      return { ok: false, error: "La imagen supera 5MB" };
    }
    if (!ALLOWED_MIME.includes(file.type)) {
      return { ok: false, error: "Formato no soportado (PNG/JPG/WEBP/SVG)" };
    }
    const ext = (file.name.match(/\.([a-z0-9]+)$/i)?.[1] ?? "png").toLowerCase();
    const path = `${slug}/testimonials/${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("brand-assets")
      .upload(path, file, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: false,
      });
    if (upErr) {
      return { ok: false, error: `No pudimos subir la imagen: ${upErr.message}` };
    }
    const { data: pub } = supabase.storage.from("brand-assets").getPublicUrl(path);
    photoUrl = pub.publicUrl;
  }

  const payload = {
    brand_id: brandId,
    author_name: parseResult.data.author_name,
    author_role: parseResult.data.author_role ?? null,
    author_company: parseResult.data.author_company ?? null,
    author_photo_url: photoUrl,
    quote: parseResult.data.quote,
    rating: parseResult.data.rating ?? null,
    display_order: parseResult.data.display_order,
    is_active: parseResult.data.is_active,
  };

  if (parseResult.data.id) {
    const { data, error } = await supabase
      .from("brand_testimonials")
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq("id", parseResult.data.id)
      .eq("brand_id", brandId)
      .select("id, author_photo_url")
      .maybeSingle();
    if (error || !data) {
      return { ok: false, error: GENERIC_ERROR };
    }
    revalidateBrand(slug);
    return { ok: true, id: data.id, author_photo_url: data.author_photo_url };
  }

  const { data, error } = await supabase
    .from("brand_testimonials")
    .insert(payload)
    .select("id, author_photo_url")
    .maybeSingle();
  if (error || !data) {
    return { ok: false, error: GENERIC_ERROR };
  }
  revalidateBrand(slug);
  return { ok: true, id: data.id, author_photo_url: data.author_photo_url };
}

export async function deleteBrandTestimonial(testimonialId: string): Promise<SimpleResult> {
  if (!z.string().uuid().safeParse(testimonialId).success) {
    return { ok: false, error: "ID de testimonio inválido" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: UNAUTHENTICATED_ERROR };

  const { data: testimonial } = await supabase
    .from("brand_testimonials")
    .select("brand_id")
    .eq("id", testimonialId)
    .maybeSingle();
  if (!testimonial) return { ok: false, error: NOT_FOUND_ERROR };

  const auth = await requireBrandAdmin(testimonial.brand_id);
  if (!auth.ok) return { ok: false, error: auth.error };

  const slug = await getBrandSlug(auth.supabase, testimonial.brand_id);

  const { error } = await auth.supabase
    .from("brand_testimonials")
    .delete()
    .eq("id", testimonialId);
  if (error) return { ok: false, error: GENERIC_ERROR };

  if (slug) revalidateBrand(slug);
  return { ok: true };
}

export async function reorderBrandSlides(
  brandId: string,
  slideIds: string[]
): Promise<SimpleResult> {
  if (!z.string().uuid().safeParse(brandId).success) {
    return { ok: false, error: "ID de marca inválido" };
  }
  const idsParse = z.array(z.string().uuid()).safeParse(slideIds);
  if (!idsParse.success) {
    return { ok: false, error: "IDs de slides inválidos" };
  }

  const auth = await requireBrandAdmin(brandId);
  if (!auth.ok) return { ok: false, error: auth.error };
  const { supabase } = auth;

  // Verificamos que los IDs pertenezcan a la brand para no permitir reorder cruzado.
  const { data: existing, error: fetchErr } = await supabase
    .from("brand_slides")
    .select("id")
    .eq("brand_id", brandId);
  if (fetchErr || !existing) return { ok: false, error: GENERIC_ERROR };
  const validIds = new Set(existing.map((s) => s.id));
  const filtered = idsParse.data.filter((id) => validIds.has(id));

  // Updates secuenciales: tabla chica, no vale la pena RPC.
  const nowIso = new Date().toISOString();
  for (let i = 0; i < filtered.length; i += 1) {
    const { error } = await supabase
      .from("brand_slides")
      .update({ display_order: i, updated_at: nowIso })
      .eq("id", filtered[i])
      .eq("brand_id", brandId);
    if (error) return { ok: false, error: GENERIC_ERROR };
  }

  const slug = await getBrandSlug(supabase, brandId);
  if (slug) revalidateBrand(slug);
  return { ok: true };
}

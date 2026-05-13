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
    .insert(brandRow)
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
    .update({ ...brandRow, updated_at: new Date().toISOString() })
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

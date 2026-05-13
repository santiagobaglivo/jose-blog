"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getAdminScope } from "@/lib/auth/admin-scope";
import { createClient } from "@/lib/supabase/server";

const UNAUTHENTICATED_ERROR = "Tu sesión expiró. Volvé a iniciar sesión.";
const FORBIDDEN_ERROR = "No tenés permisos para gestionar la galería.";
const NOT_FOUND_ERROR = "El recurso no existe o fue eliminado.";
const GENERIC_ERROR = "No pudimos completar la acción. Probá nuevamente.";
const BRAND_REQUIRED_ERROR =
  "Como super-admin sin marca activa necesitás indicar a qué marca pertenece.";

// Coherente con el bucket brand-assets (256MB) y el bodySizeLimit del server action.
const MAX_MEDIA_BYTES = 256 * 1024 * 1024;

const ALLOWED_IMAGE_MIME = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/svg+xml",
  "image/gif",
]);
const ALLOWED_VIDEO_MIME = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/ogg",
]);
const ALLOWED_DOCUMENT_MIME = new Set(["application/pdf"]);

type MediaKind = "image" | "video" | "document";

type UploadResult =
  | { ok: true; id: string; url: string; thumbnail_url: string | null }
  | { ok: false; error: string };

type EmbedResult =
  | { ok: true; id: string; url: string; thumbnail_url: string | null }
  | { ok: false; error: string };

type SimpleResult = { ok: true } | { ok: false; error: string };

/**
 * Verifica que el caller pueda gestionar la brand (super o admin local de su brand).
 * Mismo patrón que `requireBrandAdmin` en /admin/marcas/actions.ts.
 */
async function requireBrandAdmin(brandId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: UNAUTHENTICATED_ERROR };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, brand_id")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile) return { ok: false as const, error: FORBIDDEN_ERROR };

  const isSuper = profile.role === "superadmin";
  const isLocal = profile.role === "admin";
  if (!isSuper && !isLocal) return { ok: false as const, error: FORBIDDEN_ERROR };
  if (isLocal && profile.brand_id !== brandId) {
    return { ok: false as const, error: FORBIDDEN_ERROR };
  }

  return { ok: true as const, supabase, userId: user.id };
}

async function getBrandSlug(
  supabase: Awaited<ReturnType<typeof createClient>>,
  brandId: string
): Promise<string | null> {
  const { data } = await supabase
    .from("brands")
    .select("slug")
    .eq("id", brandId)
    .maybeSingle();
  return data?.slug ?? null;
}

function extFromName(name: string, fallback: string): string {
  const match = name.match(/\.([a-z0-9]+)$/i);
  return (match?.[1] ?? fallback).toLowerCase();
}

function isValidMimeForKind(kind: MediaKind, mime: string): boolean {
  if (kind === "image") return ALLOWED_IMAGE_MIME.has(mime);
  if (kind === "video") return ALLOWED_VIDEO_MIME.has(mime);
  return ALLOWED_DOCUMENT_MIME.has(mime);
}

function revalidateMedia() {
  revalidatePath("/admin/media");
}

// ============================================================================
// uploadBrandMedia: sube imagen/video/documento al bucket y persiste fila.
// ============================================================================

export async function uploadBrandMedia(formData: FormData): Promise<UploadResult> {
  const brandIdRaw = String(formData.get("brandId") ?? "").trim();
  const kindRaw = String(formData.get("kind") ?? "").trim();
  const titleRaw = String(formData.get("title") ?? "").trim();
  const file = formData.get("file");

  // Resolver brandId: si el caller no manda explícito, usar el del scope.
  const scope = await getAdminScope();
  if (scope.kind === "none") return { ok: false, error: FORBIDDEN_ERROR };

  const brandId = brandIdRaw || scope.brand?.id || "";
  if (!brandId) return { ok: false, error: BRAND_REQUIRED_ERROR };

  if (!z.string().uuid().safeParse(brandId).success) {
    return { ok: false, error: "ID de marca inválido" };
  }
  if (kindRaw !== "image" && kindRaw !== "video" && kindRaw !== "document") {
    return { ok: false, error: "Tipo de archivo inválido" };
  }
  const kind = kindRaw as MediaKind;

  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Archivo vacío o no enviado" };
  }
  if (file.size > MAX_MEDIA_BYTES) {
    return { ok: false, error: "El archivo supera 256MB" };
  }
  if (!isValidMimeForKind(kind, file.type)) {
    return { ok: false, error: `Formato no soportado para ${kind} (${file.type || "desconocido"})` };
  }

  // Admin local solo su brand (defensa sobre RLS).
  if (scope.kind === "local" && scope.brand && brandId !== scope.brand.id) {
    return { ok: false, error: FORBIDDEN_ERROR };
  }

  const auth = await requireBrandAdmin(brandId);
  if (!auth.ok) return { ok: false, error: auth.error };
  const { supabase, userId } = auth;

  const slug = await getBrandSlug(supabase, brandId);
  if (!slug) return { ok: false, error: NOT_FOUND_ERROR };

  const ext = extFromName(file.name, kind === "image" ? "png" : kind === "video" ? "mp4" : "pdf");
  const path = `${slug}/media/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error: upErr } = await supabase.storage
    .from("brand-assets")
    .upload(path, file, {
      contentType: file.type,
      cacheControl: "3600",
      upsert: false,
    });
  if (upErr) {
    return { ok: false, error: `No pudimos subir el archivo: ${upErr.message}` };
  }

  const { data: pub } = supabase.storage.from("brand-assets").getPublicUrl(path);
  const publicUrl = pub.publicUrl;

  const { data: inserted, error: insErr } = await supabase
    .from("brand_media")
    .insert({
      brand_id: brandId,
      uploader_id: userId,
      kind,
      url: publicUrl,
      thumbnail_url: kind === "image" ? publicUrl : null,
      title: titleRaw || file.name,
      mime_type: file.type || null,
      size_bytes: file.size,
    })
    .select("id, url, thumbnail_url")
    .single();

  if (insErr || !inserted) {
    // Best-effort cleanup: si la fila no se creó, sacamos el archivo del bucket.
    await supabase.storage.from("brand-assets").remove([path]);
    return { ok: false, error: GENERIC_ERROR };
  }

  revalidateMedia();
  return { ok: true, id: inserted.id, url: inserted.url, thumbnail_url: inserted.thumbnail_url };
}

// ============================================================================
// addBrandEmbed: parsea URL de YouTube/Vimeo, arma iframe HTML y persiste.
// ============================================================================

type EmbedParsed = {
  provider: "youtube" | "vimeo" | "url";
  videoId: string | null;
  embedSrc: string;
  thumbnail: string | null;
};

function parseEmbedUrl(rawUrl: string): EmbedParsed | null {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return null;
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null;

  const host = parsed.hostname.toLowerCase().replace(/^www\./, "");

  // YouTube: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID, youtube.com/shorts/ID
  if (host === "youtube.com" || host === "youtube-nocookie.com" || host === "m.youtube.com") {
    let videoId: string | null = null;
    if (parsed.pathname === "/watch") {
      videoId = parsed.searchParams.get("v");
    } else if (parsed.pathname.startsWith("/embed/")) {
      videoId = parsed.pathname.split("/")[2] ?? null;
    } else if (parsed.pathname.startsWith("/shorts/")) {
      videoId = parsed.pathname.split("/")[2] ?? null;
    }
    if (!videoId || !/^[A-Za-z0-9_-]{6,20}$/.test(videoId)) return null;
    return {
      provider: "youtube",
      videoId,
      embedSrc: `https://www.youtube.com/embed/${videoId}`,
      thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    };
  }
  if (host === "youtu.be") {
    const videoId = parsed.pathname.replace(/^\/+/, "").split("/")[0] ?? "";
    if (!/^[A-Za-z0-9_-]{6,20}$/.test(videoId)) return null;
    return {
      provider: "youtube",
      videoId,
      embedSrc: `https://www.youtube.com/embed/${videoId}`,
      thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    };
  }

  // Vimeo: vimeo.com/ID, player.vimeo.com/video/ID
  if (host === "vimeo.com" || host === "player.vimeo.com") {
    let videoId: string | null = null;
    const segments = parsed.pathname.split("/").filter(Boolean);
    if (host === "player.vimeo.com" && segments[0] === "video") {
      videoId = segments[1] ?? null;
    } else if (host === "vimeo.com") {
      videoId = segments[0] ?? null;
    }
    if (!videoId || !/^[0-9]+$/.test(videoId)) return null;
    return {
      provider: "vimeo",
      videoId,
      embedSrc: `https://player.vimeo.com/video/${videoId}`,
      thumbnail: null,
    };
  }

  return null;
}

function buildIframeHtml(src: string, title: string): string {
  // El HTML queda pre-armado y sanitizado por el editor cuando se inserta
  // en un post/página (sanitizeHtml ya whitelist el src de iframe).
  const safeTitle = title.replace(/[<>"]/g, "");
  return `<iframe src="${src}" width="560" height="315" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen title="${safeTitle}"></iframe>`;
}

const embedInputSchema = z.object({
  brandId: z.string().uuid().optional(),
  url: z.string().trim().min(5).max(500),
  title: z.string().trim().max(200).optional(),
});

export async function addBrandEmbed(formData: FormData): Promise<EmbedResult> {
  const parsed = embedInputSchema.safeParse({
    brandId: String(formData.get("brandId") ?? "").trim() || undefined,
    url: String(formData.get("url") ?? ""),
    title: String(formData.get("title") ?? "").trim() || undefined,
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? GENERIC_ERROR };
  }

  const scope = await getAdminScope();
  if (scope.kind === "none") return { ok: false, error: FORBIDDEN_ERROR };

  const brandId = parsed.data.brandId || scope.brand?.id || "";
  if (!brandId) return { ok: false, error: BRAND_REQUIRED_ERROR };
  if (!z.string().uuid().safeParse(brandId).success) {
    return { ok: false, error: "ID de marca inválido" };
  }
  if (scope.kind === "local" && scope.brand && brandId !== scope.brand.id) {
    return { ok: false, error: FORBIDDEN_ERROR };
  }

  const embed = parseEmbedUrl(parsed.data.url);
  if (!embed) {
    return { ok: false, error: "URL no soportada. Usá YouTube o Vimeo." };
  }

  const auth = await requireBrandAdmin(brandId);
  if (!auth.ok) return { ok: false, error: auth.error };
  const { supabase, userId } = auth;

  const title = parsed.data.title || `Video ${embed.provider}`;
  const embedHtml = buildIframeHtml(embed.embedSrc, title);

  const { data: inserted, error: insErr } = await supabase
    .from("brand_media")
    .insert({
      brand_id: brandId,
      uploader_id: userId,
      kind: "embed",
      url: parsed.data.url,
      thumbnail_url: embed.thumbnail,
      title,
      embed_provider: embed.provider,
      embed_html: embedHtml,
    })
    .select("id, url, thumbnail_url")
    .single();

  if (insErr || !inserted) {
    return { ok: false, error: GENERIC_ERROR };
  }

  revalidateMedia();
  return { ok: true, id: inserted.id, url: inserted.url, thumbnail_url: inserted.thumbnail_url };
}

// ============================================================================
// deleteBrandMedia: borra fila y, si es un upload, el archivo del bucket.
// ============================================================================

export async function deleteBrandMedia(mediaId: string): Promise<SimpleResult> {
  if (!z.string().uuid().safeParse(mediaId).success) {
    return { ok: false, error: "ID de media inválido" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: UNAUTHENTICATED_ERROR };

  const { data: media } = await supabase
    .from("brand_media")
    .select("brand_id, kind, url")
    .eq("id", mediaId)
    .maybeSingle();
  if (!media) return { ok: false, error: NOT_FOUND_ERROR };

  const auth = await requireBrandAdmin(media.brand_id);
  if (!auth.ok) return { ok: false, error: auth.error };

  // Si era un upload, intentamos borrar el archivo del bucket (best-effort).
  if (media.kind !== "embed") {
    const match = media.url.match(/\/brand-assets\/(.+)$/);
    const objectPath = match?.[1];
    if (objectPath) {
      // No bloqueamos por error de storage: la fila se borra igual.
      await auth.supabase.storage.from("brand-assets").remove([objectPath]);
    }
  }

  const { error } = await auth.supabase.from("brand_media").delete().eq("id", mediaId);
  if (error) return { ok: false, error: GENERIC_ERROR };

  revalidateMedia();
  return { ok: true };
}

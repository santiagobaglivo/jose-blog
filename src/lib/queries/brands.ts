import { getAdminScope } from "@/lib/auth/admin-scope";
import { createClient } from "@/lib/supabase/server";

export interface BrandService {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
}

export interface BrandSlide {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  cta_label: string | null;
  cta_href: string | null;
  display_order: number;
  is_active: boolean;
}

export interface BrandStat {
  id: string;
  label: string;
  value: string;
  suffix: string | null;
  display_order: number;
  is_active: boolean;
}

export interface BrandTeamMember {
  id: string;
  member_name: string;
  role: string;
  photo_url: string | null;
  bio: string | null;
  display_order: number;
  is_active: boolean;
}

export interface BrandTestimonial {
  id: string;
  author_name: string;
  author_role: string | null;
  author_company: string | null;
  author_photo_url: string | null;
  quote: string;
  rating: number | null;
  display_order: number;
  is_active: boolean;
}

export interface BrandSummary {
  id: string;
  slug: string;
  domain: string | null;
  name: string;
  tagline: string | null;
  hero_image: string | null;
  accent_color: string | null;
  display_order: number;
  is_active: boolean;
}

export interface BrandDetail extends BrandSummary {
  about_text: string;
  asesoria_text: string | null;
  seo_title: string | null;
  seo_description: string | null;
  whatsapp_number: string | null;
  contact_email: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  tiktok_url: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  services: BrandService[];
  slides: BrandSlide[];
  stats: BrandStat[];
  team: BrandTeamMember[];
  testimonials: BrandTestimonial[];
}

export interface AdminBrandRow extends BrandSummary {
  service_count: number;
  updated_at: string;
}

/**
 * Marcas activas para el sitio público (listado /marcas y secciones de "Sobre nosotros").
 * Solo cabecera — no trae los servicios anidados.
 */
export async function getActiveBrands(): Promise<BrandSummary[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("brands")
    .select(
      "id, slug, domain, name, tagline, hero_image, accent_color, display_order, is_active"
    )
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("display_order", { ascending: true });

  if (error || !data) return [];
  return data;
}

/**
 * Detalle completo de una marca por slug (página pública /marcas/[slug]).
 * Incluye los servicios activos ordenados.
 */
export async function getBrandBySlug(slug: string): Promise<BrandDetail | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("brands")
    .select(
      `id, slug, domain, name, tagline, hero_image, accent_color, display_order, is_active,
       about_text, asesoria_text, seo_title, seo_description, whatsapp_number, contact_email, instagram_url, facebook_url, tiktok_url, linkedin_url, twitter_url,
       services:brand_services ( id, name, description, icon, image_url, display_order, is_active ),
       slides:brand_slides ( id, title, subtitle, image_url, cta_label, cta_href, display_order, is_active ),
       stats:brand_stats ( id, label, value, suffix, display_order, is_active ),
       team:brand_team ( id, member_name, role, photo_url, bio, display_order, is_active ),
       testimonials:brand_testimonials ( id, author_name, author_role, author_company, author_photo_url, quote, rating, display_order, is_active )`
    )
    .eq("slug", slug)
    .eq("is_active", true)
    .is("deleted_at", null)
    .maybeSingle();

  if (error || !data) return null;

  const services = (data.services ?? [])
    .filter((s) => s.is_active)
    .sort((a, b) => a.display_order - b.display_order);

  const slides = (data.slides ?? [])
    .filter((s) => s.is_active)
    .sort((a, b) => a.display_order - b.display_order);

  const stats = (data.stats ?? [])
    .filter((s) => s.is_active)
    .sort((a, b) => a.display_order - b.display_order);

  const team = (data.team ?? [])
    .filter((m) => m.is_active)
    .sort((a, b) => a.display_order - b.display_order);

  const testimonials = (data.testimonials ?? [])
    .filter((t) => t.is_active)
    .sort((a, b) => a.display_order - b.display_order);

  return {
    id: data.id,
    slug: data.slug,
    domain: data.domain,
    name: data.name,
    tagline: data.tagline,
    hero_image: data.hero_image,
    accent_color: data.accent_color,
    display_order: data.display_order,
    is_active: data.is_active,
    about_text: data.about_text,
    asesoria_text: data.asesoria_text,
    seo_title: data.seo_title,
    seo_description: data.seo_description,
    whatsapp_number: data.whatsapp_number,
    contact_email: data.contact_email,
    instagram_url: data.instagram_url,
    facebook_url: data.facebook_url,
    tiktok_url: data.tiktok_url,
    linkedin_url: data.linkedin_url,
    twitter_url: data.twitter_url,
    services,
    slides,
    stats,
    team,
    testimonials,
  };
}

/**
 * Listado para el panel admin: todas las marcas no eliminadas, incluyendo las inactivas.
 * Trae el conteo de servicios para mostrar en la tabla.
 */
export async function getAllBrandsAdmin(): Promise<AdminBrandRow[]> {
  const scope = await getAdminScope();
  if (scope.kind === "none") return [];

  const supabase = await createClient();
  let query = supabase
    .from("brands")
    .select(
      `id, slug, domain, name, tagline, hero_image, accent_color, display_order, is_active, updated_at,
       services:brand_services ( id )`
    )
    .is("deleted_at", null)
    .order("display_order", { ascending: true });

  // Admin local (o super en brand subdomain) ve solo SU marca.
  if (scope.brand) query = query.eq("id", scope.brand.id);
  const { data, error } = await query;

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    slug: row.slug,
    domain: row.domain,
    name: row.name,
    tagline: row.tagline,
    hero_image: row.hero_image,
    accent_color: row.accent_color,
    display_order: row.display_order,
    is_active: row.is_active,
    updated_at: row.updated_at,
    service_count: row.services?.length ?? 0,
  }));
}

/**
 * Detalle completo por id para el editor del admin (carga la marca + todos sus servicios,
 * incluso inactivos, para que el admin pueda re-activarlos).
 */
export async function getBrandByIdAdmin(id: string): Promise<BrandDetail | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("brands")
    .select(
      `id, slug, domain, name, tagline, hero_image, accent_color, display_order, is_active,
       about_text, asesoria_text, seo_title, seo_description, whatsapp_number, contact_email, instagram_url, facebook_url, tiktok_url, linkedin_url, twitter_url,
       services:brand_services ( id, name, description, icon, image_url, display_order, is_active ),
       slides:brand_slides ( id, title, subtitle, image_url, cta_label, cta_href, display_order, is_active ),
       stats:brand_stats ( id, label, value, suffix, display_order, is_active ),
       team:brand_team ( id, member_name, role, photo_url, bio, display_order, is_active ),
       testimonials:brand_testimonials ( id, author_name, author_role, author_company, author_photo_url, quote, rating, display_order, is_active )`
    )
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  if (error || !data) return null;

  const services = (data.services ?? []).sort((a, b) => a.display_order - b.display_order);
  const slides = (data.slides ?? []).sort((a, b) => a.display_order - b.display_order);
  const stats = (data.stats ?? []).sort((a, b) => a.display_order - b.display_order);
  const team = (data.team ?? []).sort((a, b) => a.display_order - b.display_order);
  const testimonials = (data.testimonials ?? []).sort(
    (a, b) => a.display_order - b.display_order
  );

  return {
    id: data.id,
    slug: data.slug,
    domain: data.domain,
    name: data.name,
    tagline: data.tagline,
    hero_image: data.hero_image,
    accent_color: data.accent_color,
    display_order: data.display_order,
    is_active: data.is_active,
    about_text: data.about_text,
    asesoria_text: data.asesoria_text,
    seo_title: data.seo_title,
    seo_description: data.seo_description,
    whatsapp_number: data.whatsapp_number,
    contact_email: data.contact_email,
    instagram_url: data.instagram_url,
    facebook_url: data.facebook_url,
    tiktok_url: data.tiktok_url,
    linkedin_url: data.linkedin_url,
    twitter_url: data.twitter_url,
    services,
    slides,
    stats,
    team,
    testimonials,
  };
}

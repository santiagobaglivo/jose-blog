import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Mail, UserRound } from "lucide-react";

import { BrandStats } from "@/components/shared/brand-stats";
import { BrandTestimonials } from "@/components/shared/brand-testimonials";
import { ServiceIcon } from "@/components/shared/service-icon";
import { WhatsappCTA } from "@/components/shared/whatsapp-cta";
import { getBrandBySlug } from "@/lib/queries/brands";
import { createAdminClient } from "@/lib/supabase/admin";
import { HeroCarousel } from "./hero-carousel";

export const revalidate = 300;

export async function generateStaticParams() {
  // No usar createClient() del server: corre en build time, sin request → no hay cookies.
  // try/catch para tolerar build en CI sin DB accesible: las páginas se generan on-demand.
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("brands")
      .select("slug")
      .eq("is_active", true)
      .is("deleted_at", null)
      .order("display_order", { ascending: true });
    return (data ?? []).map((b) => ({ brand: b.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ brand: string }>;
}): Promise<Metadata> {
  const { brand: slug } = await params;
  const brand = await getBrandBySlug(slug);
  if (!brand) return { title: "Marca no encontrada" };

  return {
    title: brand.seo_title ?? brand.name,
    description: brand.seo_description ?? brand.tagline ?? undefined,
  };
}

function paragraphs(text: string) {
  return text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export default async function BrandPage({ params }: { params: Promise<{ brand: string }> }) {
  const { brand: slug } = await params;
  const brand = await getBrandBySlug(slug);
  if (!brand) notFound();

  const accent = brand.accent_color ?? "#1e3a5f";
  const aboutParagraphs = paragraphs(brand.about_text);
  const asesoriaParagraphs = brand.asesoria_text ? paragraphs(brand.asesoria_text) : [];

  const whatsappMsg = `Hola, quiero hacer una consulta sobre ${brand.name}.`;
  const activeSlides = brand.slides.filter((s) => s.is_active);
  const team = brand.team;

  return (
    <>
      {/* Hero: si hay slides activos => carrusel; si no, hero estático full-bleed */}
      {activeSlides.length > 0 ? (
        <HeroCarousel slides={activeSlides} accent={accent} />
      ) : (
        <section
          className="relative overflow-hidden border-b border-border/40"
          style={{
            background: `linear-gradient(135deg, ${accent}1f 0%, ${accent}08 45%, transparent 100%)`,
          }}
        >
          {/* Patrón decorativo de fondo */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, ${accent} 1px, transparent 0)`,
              backgroundSize: "32px 32px",
            }}
          />

          <div className="relative mx-auto max-w-7xl px-6 lg:px-8 pt-24 pb-28 lg:pt-32 lg:pb-40">
            <div className="max-w-4xl">
              <span
                className="inline-flex items-center px-3.5 h-8 rounded-full text-[0.6875rem] font-semibold uppercase tracking-[0.2em]"
                style={{
                  backgroundColor: `${accent}1f`,
                  color: accent,
                  border: `1px solid ${accent}33`,
                }}
              >
                Marca del estudio
              </span>
              <h1 className="mt-8 text-5xl sm:text-6xl lg:text-7xl font-semibold text-foreground tracking-tight font-serif leading-[1.05]">
                {brand.name}
              </h1>
              {brand.tagline && (
                <p className="mt-8 text-xl lg:text-2xl text-muted-foreground leading-relaxed max-w-3xl">
                  {brand.tagline}
                </p>
              )}

              <div className="mt-12 flex flex-wrap items-center gap-4">
                <WhatsappCTA message={whatsappMsg} variant="primary" />
                <Link
                  href="/contacto"
                  className="inline-flex items-center gap-2 h-11 px-6 rounded-lg text-[0.875rem] font-medium border border-border/60 bg-background/60 backdrop-blur-sm hover:bg-secondary/60 transition-colors"
                >
                  <Mail className="h-4 w-4" aria-hidden="true" />
                  Contacto por correo
                </Link>
              </div>
            </div>
          </div>

          {/* Línea decorativa inferior con el accent */}
          <div
            aria-hidden="true"
            className="absolute bottom-0 left-0 right-0 h-px"
            style={{
              background: `linear-gradient(90deg, transparent 0%, ${accent}66 50%, transparent 100%)`,
            }}
          />
        </section>
      )}

      {/* Sobre la marca — layout editorial con barra de accent */}
      <section className="py-24 lg:py-32 bg-background">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-16 lg:grid-cols-12 lg:gap-20">
            <div className="lg:col-span-5">
              <div className="lg:sticky lg:top-24">
                <p
                  className="text-xs font-semibold uppercase tracking-[0.2em] mb-5"
                  style={{ color: accent }}
                >
                  Quiénes somos
                </p>
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-foreground tracking-tight font-serif leading-[1.1]">
                  Conocé {brand.name}
                </h2>
                <div
                  aria-hidden="true"
                  className="mt-8 h-1 w-16 rounded-full"
                  style={{ backgroundColor: accent }}
                />
              </div>
            </div>
            <div className="lg:col-span-7 space-y-6">
              {aboutParagraphs.map((p, i) => (
                <p
                  key={i}
                  className="text-lg leading-relaxed text-muted-foreground"
                >
                  {p}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Cifras destacadas */}
      {brand.stats.length > 0 && (
        <BrandStats stats={brand.stats} accent={accent} />
      )}

      {/* Servicios — cards prominentes */}
      {brand.services.length > 0 && (
        <section className="py-24 lg:py-32 bg-background">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="max-w-3xl mb-16">
              <p
                className="text-xs font-semibold uppercase tracking-[0.2em] mb-5"
                style={{ color: accent }}
              >
                Servicios
              </p>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-foreground tracking-tight font-serif leading-[1.1]">
                Qué podemos hacer por vos
              </h2>
              <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
                {brand.services.length} servicios profesionales a tu disposición. Contactanos para
                analizar tu caso puntual y armar la mejor estrategia.
              </p>
            </div>

            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {brand.services.map((service) => (
                <li
                  key={service.id}
                  className="group relative flex flex-col rounded-xl bg-card border border-border/40 p-7 lg:p-8 shadow-sm hover:shadow-md hover:border-border/70 transition-all duration-300"
                >
                  <div className="mb-6">
                    {service.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={service.image_url}
                        alt=""
                        className="h-16 w-16 rounded-xl object-cover border border-border/30"
                        loading="lazy"
                      />
                    ) : (
                      <div
                        className="h-14 w-14 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                        style={{
                          backgroundColor: `${accent}14`,
                          border: `1px solid ${accent}26`,
                        }}
                      >
                        {service.icon ? (
                          <ServiceIcon
                            name={service.icon}
                            className="h-7 w-7"
                            style={{ color: accent }}
                            aria-hidden="true"
                            fallback={
                              <CheckCircle2
                                className="h-7 w-7"
                                style={{ color: accent }}
                                aria-hidden="true"
                              />
                            }
                          />
                        ) : (
                          <CheckCircle2
                            className="h-7 w-7"
                            style={{ color: accent }}
                            aria-hidden="true"
                          />
                        )}
                      </div>
                    )}
                  </div>
                  <h3 className="text-xl font-semibold text-foreground tracking-tight font-serif leading-snug">
                    {service.name}
                  </h3>
                  {service.description && (
                    <p className="mt-3 text-[0.9375rem] text-muted-foreground leading-relaxed">
                      {service.description}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Cómo trabajamos — layout editorial */}
      {asesoriaParagraphs.length > 0 && (
        <section className="py-24 lg:py-32 bg-secondary/30 border-y border-border/40">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid gap-16 lg:grid-cols-12 lg:gap-20">
              <div className="lg:col-span-5">
                <div className="lg:sticky lg:top-24">
                  <p
                    className="text-xs font-semibold uppercase tracking-[0.2em] mb-5"
                    style={{ color: accent }}
                  >
                    Cómo trabajamos
                  </p>
                  <h2 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-foreground tracking-tight font-serif leading-[1.1]">
                    Nuestra forma de asesorar
                  </h2>
                  <div
                    aria-hidden="true"
                    className="mt-8 h-1 w-16 rounded-full"
                    style={{ backgroundColor: accent }}
                  />
                </div>
              </div>
              <div className="lg:col-span-7 space-y-6">
                {asesoriaParagraphs.map((p, i) => (
                  <p
                    key={i}
                    className="text-lg leading-relaxed text-muted-foreground"
                  >
                    {p}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Equipo directivo */}
      {team.length > 0 && (
        <section className="py-24 lg:py-32 bg-background">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="max-w-3xl mb-16">
              <p
                className="text-xs font-semibold uppercase tracking-[0.2em] mb-5"
                style={{ color: accent }}
              >
                Equipo
              </p>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-foreground tracking-tight font-serif leading-[1.1]">
                Equipo directivo
              </h2>
              <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
                Profesionales detrás de {brand.name}, comprometidos con cada caso.
              </p>
            </div>

            <ul
              className={`grid gap-8 sm:gap-10 ${
                team.length >= 4
                  ? "sm:grid-cols-2 lg:grid-cols-4"
                  : team.length === 3
                    ? "sm:grid-cols-3"
                    : team.length === 2
                      ? "sm:grid-cols-2"
                      : "sm:grid-cols-1 max-w-xs"
              }`}
            >
              {team.map((member) => (
                <li key={member.id} className="group">
                  <div
                    className="aspect-square w-full overflow-hidden rounded-xl bg-secondary/40 border border-border/40 mb-5"
                  >
                    {member.photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={member.photo_url}
                        alt={member.member_name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        loading="lazy"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-muted-foreground/30">
                        <UserRound className="h-20 w-20" aria-hidden="true" />
                      </div>
                    )}
                  </div>
                  <h3 className="text-xl font-semibold text-foreground tracking-tight font-serif leading-snug">
                    {member.member_name}
                  </h3>
                  <p
                    className="mt-2 text-[0.6875rem] font-semibold uppercase tracking-[0.2em]"
                    style={{ color: accent }}
                  >
                    {member.role}
                  </p>
                  {member.bio && (
                    <p className="mt-3 text-[0.9375rem] text-muted-foreground leading-relaxed">
                      {member.bio}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Testimonios de clientes */}
      {brand.testimonials.length > 0 && (
        <BrandTestimonials testimonials={brand.testimonials} accent={accent} />
      )}

      {/* CTA final — full bleed con accent */}
      <section
        className="relative overflow-hidden py-24 lg:py-32"
        style={{
          background: `linear-gradient(135deg, ${accent}14 0%, ${accent}29 100%)`,
        }}
      >
        {/* Patrón decorativo */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, ${accent} 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />
        <div
          aria-hidden="true"
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${accent}66 50%, transparent 100%)`,
          }}
        />

        <div className="relative mx-auto max-w-4xl px-6 lg:px-8 text-center">
          <p
            className="text-xs font-semibold uppercase tracking-[0.2em] mb-5"
            style={{ color: accent }}
          >
            Hablemos
          </p>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-foreground tracking-tight font-serif leading-[1.1]">
            ¿Tenés un caso de {brand.name}?
          </h2>
          <p className="mt-8 text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Conversá con nosotros y te orientamos en el primer contacto. Respondemos por WhatsApp o
            correo, sin compromiso.
          </p>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
            <WhatsappCTA message={whatsappMsg} variant="primary" />
            <Link
              href="/contacto"
              className="inline-flex items-center gap-2 h-11 px-6 rounded-lg text-[0.875rem] font-medium border border-border/60 bg-background hover:bg-background/80 transition-colors"
            >
              Formulario de contacto
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

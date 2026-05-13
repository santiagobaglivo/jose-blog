import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Mail } from "lucide-react";

import { WhatsappCTA } from "@/components/shared/whatsapp-cta";
import { getBrandBySlug } from "@/lib/queries/brands";
import { createAdminClient } from "@/lib/supabase/admin";

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

  return (
    <>
      {/* Hero */}
      <section
        className="relative overflow-hidden border-b border-border/50"
        style={{
          background: `linear-gradient(135deg, ${accent}14 0%, transparent 60%)`,
        }}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8 pt-16 pb-16 lg:pb-24">
          <div className="max-w-3xl">
            <span
              className="inline-flex items-center px-3 h-7 rounded-full text-[0.6875rem] font-semibold uppercase tracking-widest"
              style={{ backgroundColor: `${accent}1f`, color: accent }}
            >
              Marca del estudio
            </span>
            <h1 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-semibold text-foreground tracking-tight font-serif">
              {brand.name}
            </h1>
            {brand.tagline && (
              <p className="mt-4 text-lg lg:text-xl text-muted-foreground leading-relaxed">
                {brand.tagline}
              </p>
            )}

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <WhatsappCTA message={whatsappMsg} variant="primary" />
              <Link
                href="/contacto"
                className="inline-flex items-center gap-2 h-11 px-5 rounded-lg text-[0.875rem] font-medium border border-border hover:bg-secondary/60 transition-colors"
              >
                <Mail className="h-4 w-4" aria-hidden="true" />
                Contacto por correo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Sobre la marca */}
      <section className="py-14 lg:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-3"
              style={{ color: accent }}
            >
              Quiénes somos
            </p>
            <h2 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight font-serif">
              Conocé {brand.name}
            </h2>
          </div>
          <div className="lg:col-span-2 space-y-4">
            {aboutParagraphs.map((p, i) => (
              <p
                key={i}
                className="text-[0.9375rem] leading-relaxed text-muted-foreground"
              >
                {p}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* Servicios */}
      {brand.services.length > 0 && (
        <section className="py-14 lg:py-20 bg-secondary/30 border-y border-border/50">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="max-w-2xl">
              <p
                className="text-xs font-semibold uppercase tracking-widest mb-3"
                style={{ color: accent }}
              >
                Servicios
              </p>
              <h2 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight font-serif">
                Qué podemos hacer por vos
              </h2>
              <p className="mt-3 text-[0.9375rem] text-muted-foreground">
                {brand.services.length} servicios profesionales disponibles. Contactanos para
                analizar tu caso puntual.
              </p>
            </div>

            <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {brand.services.map((service) => (
                <li
                  key={service.id}
                  className="flex items-start gap-3 p-4 rounded-lg bg-background border border-border/50 hover:border-border transition-colors"
                >
                  <CheckCircle2
                    className="h-4 w-4 shrink-0 mt-0.5"
                    style={{ color: accent }}
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <p className="text-[0.875rem] font-medium text-foreground leading-snug">
                      {service.name}
                    </p>
                    {service.description && (
                      <p className="mt-1 text-[0.8125rem] text-muted-foreground leading-relaxed">
                        {service.description}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Cómo trabajamos */}
      {asesoriaParagraphs.length > 0 && (
        <section className="py-14 lg:py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 grid gap-12 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <p
                className="text-xs font-semibold uppercase tracking-widest mb-3"
                style={{ color: accent }}
              >
                Cómo trabajamos
              </p>
              <h2 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight font-serif">
                Nuestra forma de asesorar
              </h2>
            </div>
            <div className="lg:col-span-2 space-y-4">
              {asesoriaParagraphs.map((p, i) => (
                <p
                  key={i}
                  className="text-[0.9375rem] leading-relaxed text-muted-foreground"
                >
                  {p}
                </p>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA final */}
      <section
        className="py-16 lg:py-24"
        style={{
          background: `linear-gradient(180deg, ${accent}0a 0%, ${accent}1a 100%)`,
        }}
      >
        <div className="mx-auto max-w-3xl px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight font-serif">
            ¿Tenés un caso de {brand.name}?
          </h2>
          <p className="mt-4 text-[0.9375rem] text-muted-foreground">
            Conversá con nosotros y te orientamos en el primer contacto. Respondemos por WhatsApp o
            correo.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <WhatsappCTA message={whatsappMsg} variant="primary" />
            <Link
              href="/contacto"
              className="inline-flex items-center gap-2 h-11 px-5 rounded-lg text-[0.875rem] font-medium border border-border bg-background hover:bg-secondary/60 transition-colors"
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

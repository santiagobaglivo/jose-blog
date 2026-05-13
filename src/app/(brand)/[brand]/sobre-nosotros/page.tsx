import { notFound } from "next/navigation";
import { Award, Target, Handshake } from "lucide-react";

import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { SectionHeader } from "@/components/shared/section-header";
import { getBrandBySlug } from "@/lib/queries/brands";
import { getTeamMembers } from "@/lib/queries/users";

const values = [
  {
    icon: Award,
    title: "Excelencia profesional",
    description:
      "Cada servicio que brindamos responde a los más altos estándares de calidad técnica y ética profesional.",
  },
  {
    icon: Target,
    title: "Enfoque estratégico",
    description:
      "No nos limitamos a cumplir con obligaciones formales. Acompañamos a nuestros clientes en la toma de decisiones clave.",
  },
  {
    icon: Handshake,
    title: "Cercanía y compromiso",
    description:
      "Construimos relaciones de largo plazo basadas en la confianza, la transparencia y la comunicación permanente.",
  },
];

function paragraphs(text: string) {
  return text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export default async function SobreNosotrosPage({
  params,
}: {
  params: Promise<{ brand: string }>;
}) {
  const { brand: slug } = await params;
  const brand = await getBrandBySlug(slug);
  if (!brand) notFound();

  const aboutParagraphs = paragraphs(brand.about_text);
  const team = await getTeamMembers();
  const accent = brand.accent_color ?? "var(--primary)";

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-secondary/40 to-transparent pt-10 pb-20 lg:pb-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Breadcrumbs items={[{ label: "Sobre nosotros" }]} />
          <div className="mt-8 max-w-3xl">
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-4 font-sans"
              style={{ color: accent }}
            >
              Sobre nosotros
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-foreground tracking-tight leading-[1.15]">
              {brand.name}
            </h1>
            {brand.tagline && (
              <p className="mt-5 text-lg text-muted-foreground leading-relaxed">{brand.tagline}</p>
            )}
            <div className="mt-8 space-y-4">
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
        </div>
      </section>

      {/* Values */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionHeader
            eyebrow="Lo que nos define"
            title="Nuestros valores"
            description="Estos principios guían cada interacción con nuestros clientes y cada decisión del estudio."
          />
          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value) => (
              <div key={value.title} className="text-center">
                <div className="mx-auto h-12 w-12 rounded-xl bg-secondary/80 flex items-center justify-center text-muted-foreground">
                  <value.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-foreground font-sans">
                  {value.title}
                </h3>
                <p className="mt-2.5 text-[0.875rem] leading-relaxed text-muted-foreground">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team — getTeamMembers trae admins de la brand desde Supabase. */}
      {team.length > 0 && (
        <section className="py-20 lg:py-28 bg-secondary/20">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <SectionHeader
              eyebrow="Equipo profesional"
              title="Quiénes somos"
              description="Profesionales con trayectoria, formación de excelencia y compromiso con cada cliente."
            />
            <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8">
              {team.map((member) => (
                <div
                  key={member.name}
                  className="bg-card border border-border/50 rounded-xl p-8 text-center hover:shadow-sm transition-all duration-300"
                >
                  <div
                    className="mx-auto h-20 w-20 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: accent }}
                  >
                    <span className="text-white text-xl font-semibold font-serif">
                      {member.avatar}
                    </span>
                  </div>
                  <h3 className="mt-5 text-base font-semibold text-foreground font-sans">
                    {member.name}
                  </h3>
                  <p className="mt-1 text-[0.8125rem] font-medium text-muted-foreground">
                    {member.role}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

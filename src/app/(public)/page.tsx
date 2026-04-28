import Link from "next/link";
import { ArrowRight, Scale, BarChart3, Building2, Users, Shield, TrendingUp } from "lucide-react";
import { getPublishedPosts } from "@/lib/queries/posts";
import { SectionHeader } from "@/components/shared/section-header";
import { ArticleCard } from "@/components/blog/article-card";

const services = [
  {
    icon: Scale,
    title: "Asesoría Impositiva",
    description:
      "Planificación fiscal integral, liquidación de impuestos y representación ante organismos fiscales.",
  },
  {
    icon: BarChart3,
    title: "Contabilidad & Auditoría",
    description:
      "Registración contable, confección de balances, informes financieros y auditoría externa.",
  },
  {
    icon: Building2,
    title: "Consultoría Empresarial",
    description:
      "Constitución de sociedades, reestructuraciones, due diligence y planificación estratégica.",
  },
  {
    icon: Users,
    title: "Laboral & RRHH",
    description:
      "Liquidación de sueldos, asesoramiento en convenios colectivos, ART y relaciones laborales.",
  },
  {
    icon: Shield,
    title: "Compliance & Normativa",
    description:
      "Prevención de lavado de activos, UIF, régimen informativo y cumplimiento regulatorio.",
  },
  {
    icon: TrendingUp,
    title: "Finanzas & Patrimonio",
    description:
      "Planificación patrimonial, estructuración de inversiones y optimización financiera.",
  },
];

const stats = [
  { value: "20+", label: "Años de trayectoria" },
  { value: "350+", label: "Clientes activos" },
  { value: "12", label: "Profesionales" },
  { value: "98%", label: "Tasa de retención" },
];

export default async function HomePage() {
  const published = await getPublishedPosts();
  const recentPosts = published.slice(0, 3);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-transparent to-warm/[0.04]" />
        <div className="mx-auto max-w-7xl px-6 lg:px-8 pt-20 pb-24 lg:pt-28 lg:pb-32 relative">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-warm mb-5 font-sans">
              Estudio contable & consultoría
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-foreground leading-[1.1]">
              Soluciones profesionales para cada etapa de su negocio
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-2xl">
              Más de dos décadas brindando asesoramiento contable, impositivo y empresarial con
              excelencia, cercanía y compromiso. Acompañamos a empresas y profesionales en la toma
              de decisiones estratégicas.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/contacto"
                className="inline-flex h-11 px-6 items-center justify-center rounded-lg bg-primary text-primary-foreground text-[0.875rem] font-medium hover:bg-primary/90 transition-colors"
              >
                Contactar al Estudio
              </Link>
              <Link
                href="/sobre-nosotros"
                className="inline-flex h-11 px-6 items-center justify-center rounded-lg border border-border text-[0.875rem] font-medium text-foreground hover:bg-secondary/60 transition-colors"
              >
                Conocer más
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border/50 bg-secondary/30">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12 lg:py-14">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl lg:text-4xl font-semibold text-foreground font-serif">
                  {stat.value}
                </div>
                <div className="mt-1.5 text-[0.8125rem] text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionHeader
            eyebrow="Áreas de práctica"
            title="Servicios integrales para su empresa"
            description="Brindamos asesoramiento especializado en cada área clave, con un enfoque multidisciplinario que integra lo contable, lo impositivo y lo estratégico."
          />
          <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div
                key={service.title}
                className="group p-6 rounded-xl border border-border/50 bg-card hover:border-border hover:shadow-sm transition-all duration-300"
              >
                <div className="h-10 w-10 rounded-lg bg-secondary/80 flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                  <service.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-foreground font-sans">
                  {service.title}
                </h3>
                <p className="mt-2 text-[0.8125rem] leading-relaxed text-muted-foreground">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Articles */}
      <section className="py-20 lg:py-28 bg-secondary/20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <SectionHeader
              eyebrow="Blog profesional"
              title="Últimas publicaciones"
              description="Artículos, guías y análisis actualizados redactados por nuestro equipo de profesionales."
              align="left"
            />
            <Link
              href="/blog"
              className="hidden sm:inline-flex items-center gap-2 text-[0.8125rem] font-medium text-muted-foreground hover:text-foreground transition-colors shrink-0 ml-8"
            >
              Ver todas
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentPosts.map((post) => (
              <ArticleCard key={post.slug} post={post} />
            ))}
          </div>
          <div className="mt-8 text-center sm:hidden">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-[0.875rem] font-medium text-foreground"
            >
              Ver todas las publicaciones
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="relative rounded-2xl bg-primary p-10 lg:p-16 overflow-hidden">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/[0.04] to-transparent" />
            <div className="relative max-w-2xl">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-primary-foreground tracking-tight">
                ¿Necesita asesoramiento profesional?
              </h2>
              <p className="mt-4 text-[0.9375rem] leading-relaxed text-primary-foreground/70">
                Nuestro equipo está preparado para analizar su situación particular y ofrecerle una
                solución a medida. Coordine una consulta sin compromiso.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/contacto"
                  className="inline-flex h-11 px-6 items-center justify-center rounded-lg bg-white text-primary text-[0.875rem] font-medium hover:bg-white/90 transition-colors"
                >
                  Agendar consulta
                </Link>
                <Link
                  href="/foros"
                  className="inline-flex h-11 px-6 items-center justify-center rounded-lg border border-white/20 text-primary-foreground text-[0.875rem] font-medium hover:bg-white/10 transition-colors"
                >
                  Consultar en el foro
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { SectionHeader } from "@/components/shared/section-header";
import { authors } from "@/lib/mock-data";
import { Award, Target, Handshake } from "lucide-react";

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

const team = [
  {
    ...authors[0],
    bio: "Contador Público (UBA). Más de 25 años de experiencia en asesoramiento impositivo y consultoría empresarial. Especialista en planificación fiscal para empresas medianas y grandes.",
  },
  {
    ...authors[1],
    bio: "Contadora Pública (UCA). Especialista en tributación y procedimiento fiscal. Directora del área impositiva del Estudio con foco en régimen de retenciones y percepciones.",
  },
  {
    ...authors[2],
    bio: "Licenciado en Administración (UTDT). MBA (IAE). Consultor en gestión empresarial, reestructuraciones corporativas y procesos de due diligence.",
  },
];

export default function SobreNosotrosPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-secondary/40 to-transparent pt-10 pb-20 lg:pb-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Breadcrumbs items={[{ label: "Sobre el Estudio" }]} />
          <div className="mt-8 max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-warm mb-4 font-sans">
              Nuestra historia
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-foreground tracking-tight leading-[1.15]">
              Un estudio construido sobre la confianza y la excelencia
            </h1>
            <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
              Desde 2004, Velázquez & Asociados acompaña a empresas,
              profesionales y emprendedores con un servicio integral, cercano y
              de alto nivel técnico. Nuestro equipo multidisciplinario combina
              experiencia, actualización permanente y un compromiso genuino con
              cada cliente.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionHeader
            eyebrow="Lo que nos define"
            title="Nuestros valores"
            description="Estos principios guían cada interacción con nuestros clientes y cada decisión dentro del Estudio."
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

      {/* Team */}
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
                <div className="mx-auto h-20 w-20 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground text-xl font-semibold font-serif">
                    {member.avatar}
                  </span>
                </div>
                <h3 className="mt-5 text-base font-semibold text-foreground font-sans">
                  {member.name}
                </h3>
                <p className="mt-1 text-[0.8125rem] font-medium text-warm">
                  {member.role}
                </p>
                <p className="mt-3 text-[0.8125rem] leading-relaxed text-muted-foreground">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionHeader
            eyebrow="Trayectoria"
            title="Hitos del Estudio"
          />
          <div className="mt-14 max-w-2xl mx-auto space-y-8">
            {[
              { year: "2004", text: "Fundación del Estudio por Martín Velázquez como profesional independiente." },
              { year: "2010", text: "Incorporación del área de consultoría empresarial y expansión del equipo." },
              { year: "2015", text: "Apertura de la segunda oficina y consolidación de la cartera corporativa." },
              { year: "2020", text: "Digitalización integral de procesos y lanzamiento del portal de clientes." },
              { year: "2024", text: "Más de 350 clientes activos y un equipo de 12 profesionales especializados." },
            ].map((item) => (
              <div key={item.year} className="flex gap-6 items-start">
                <div className="shrink-0 w-16 text-right">
                  <span className="text-lg font-semibold text-foreground font-serif">{item.year}</span>
                </div>
                <div className="relative pt-1">
                  <div className="absolute top-2 -left-[1.1875rem] h-2.5 w-2.5 rounded-full bg-warm border-2 border-background" />
                  <div className="border-l border-border/60 pl-6 pb-6">
                    <p className="text-[0.875rem] text-muted-foreground leading-relaxed">{item.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

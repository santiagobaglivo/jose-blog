import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

const contactInfo = [
  {
    icon: MapPin,
    title: "Dirección",
    detail: "Av. Córdoba 1234, Piso 8, Of. B",
    sub: "Ciudad Autónoma de Buenos Aires",
  },
  {
    icon: Phone,
    title: "Teléfono",
    detail: "+54 11 4567-8900",
    sub: "Lunes a viernes de 9 a 18 h",
  },
  {
    icon: Mail,
    title: "Email",
    detail: "contacto@velazquezyasociados.com",
    sub: "Respondemos en 24 horas hábiles",
  },
  {
    icon: Clock,
    title: "Horario de atención",
    detail: "Lunes a viernes, 9:00 a 18:00",
    sub: "Sábados de 9:00 a 13:00 con cita previa",
  },
];

export default function ContactoPage() {
  return (
    <>
      <section className="bg-gradient-to-b from-secondary/40 to-transparent pt-10 pb-8">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Breadcrumbs items={[{ label: "Contacto" }]} />
          <div className="mt-8 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-warm mb-3 font-sans">
              Contacto
            </p>
            <h1 className="text-3xl sm:text-4xl font-semibold text-foreground tracking-tight">
              Estamos para ayudarlo
            </h1>
            <p className="mt-3 text-[0.9375rem] text-muted-foreground">
              Complete el formulario o comuníquese directamente con nuestro equipo. Coordinaremos
              una reunión para analizar su situación particular.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">
            {/* Form */}
            <div className="lg:col-span-3">
              <div className="bg-card border border-border/50 rounded-xl p-8">
                <h2 className="text-lg font-semibold text-foreground font-sans mb-6">
                  Envíenos su consulta
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-[0.8125rem] font-medium text-foreground mb-1.5">
                      Nombre completo
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Juan Pérez"
                      className="w-full h-10 px-4 bg-secondary/30 border border-border/50 rounded-lg text-[0.8125rem] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/40 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[0.8125rem] font-medium text-foreground mb-1.5">
                      Email
                    </label>
                    <input
                      type="email"
                      placeholder="juan@empresa.com"
                      className="w-full h-10 px-4 bg-secondary/30 border border-border/50 rounded-lg text-[0.8125rem] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/40 transition-all"
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-[0.8125rem] font-medium text-foreground mb-1.5">
                    Teléfono (opcional)
                  </label>
                  <input
                    type="tel"
                    placeholder="+54 11 1234-5678"
                    className="w-full h-10 px-4 bg-secondary/30 border border-border/50 rounded-lg text-[0.8125rem] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/40 transition-all"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-[0.8125rem] font-medium text-foreground mb-1.5">
                    Asunto
                  </label>
                  <select className="w-full h-10 px-4 bg-secondary/30 border border-border/50 rounded-lg text-[0.8125rem] text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/40 transition-all appearance-none">
                    <option>Seleccione un área</option>
                    <option>Asesoría impositiva</option>
                    <option>Contabilidad</option>
                    <option>Consultoría empresarial</option>
                    <option>Laboral & RRHH</option>
                    <option>Otro</option>
                  </select>
                </div>
                <div className="mb-6">
                  <label className="block text-[0.8125rem] font-medium text-foreground mb-1.5">
                    Mensaje
                  </label>
                  <textarea
                    rows={5}
                    placeholder="Describa brevemente su consulta..."
                    className="w-full px-4 py-3 bg-secondary/30 border border-border/50 rounded-lg text-[0.8125rem] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/40 transition-all resize-none"
                  />
                </div>
                <button className="h-11 px-6 bg-primary text-primary-foreground text-[0.875rem] font-medium rounded-lg hover:bg-primary/90 transition-colors">
                  Enviar consulta
                </button>
              </div>
            </div>

            {/* Info */}
            <div className="lg:col-span-2 space-y-6">
              {contactInfo.map((info) => (
                <div key={info.title} className="flex gap-4">
                  <div className="shrink-0 h-10 w-10 rounded-lg bg-secondary/80 flex items-center justify-center text-muted-foreground">
                    <info.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-[0.875rem] font-semibold text-foreground font-sans">
                      {info.title}
                    </h3>
                    <p className="mt-0.5 text-[0.8125rem] text-foreground">{info.detail}</p>
                    <p className="text-[0.75rem] text-muted-foreground">{info.sub}</p>
                  </div>
                </div>
              ))}

              {/* Map placeholder */}
              <div className="mt-4 rounded-xl overflow-hidden aspect-[4/3] bg-secondary/60 flex items-center justify-center border border-border/50">
                <div className="text-center">
                  <MapPin className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-[0.8125rem] text-muted-foreground/50">Mapa interactivo</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

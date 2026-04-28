import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, FileText, Calendar } from "lucide-react";

export default function PerfilPage() {
  return (
    <>
      <section className="bg-gradient-to-b from-secondary/40 to-transparent pt-10 pb-8">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Breadcrumbs items={[{ label: "Mi Perfil" }]} />
        </div>
      </section>

      <section className="py-8 lg:py-12">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          {/* Profile header */}
          <div className="flex flex-col sm:flex-row items-start gap-6 mb-10">
            <div className="h-20 w-20 rounded-full bg-primary flex items-center justify-center shrink-0">
              <span className="text-primary-foreground text-xl font-semibold font-serif">LG</span>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-semibold text-foreground">Laura Giménez</h1>
              <p className="text-[0.875rem] text-muted-foreground mt-1">
                Contadora independiente — Miembro desde marzo de 2026
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="secondary" className="text-[0.75rem]">
                  Usuario
                </Badge>
              </div>
            </div>
            <button className="h-9 px-4 border border-border text-[0.8125rem] font-medium rounded-lg hover:bg-secondary/60 transition-colors shrink-0">
              Editar perfil
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-10">
            {[
              { icon: MessageSquare, label: "Comentarios", value: "3" },
              { icon: FileText, label: "Hilos creados", value: "2" },
              { icon: Calendar, label: "Última actividad", value: "Hoy" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-card border border-border/50 rounded-xl p-4 text-center"
              >
                <stat.icon className="h-5 w-5 text-muted-foreground mx-auto mb-2" />
                <div className="text-lg font-semibold text-foreground font-serif">{stat.value}</div>
                <div className="text-[0.75rem] text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Profile form */}
          <div className="bg-card border border-border/50 rounded-xl p-8">
            <h2 className="text-lg font-semibold text-foreground font-sans mb-6">
              Información personal
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-[0.8125rem] font-medium text-foreground mb-1.5">
                  Nombre
                </label>
                <input
                  type="text"
                  defaultValue="Laura"
                  className="w-full h-10 px-4 bg-secondary/30 border border-border/50 rounded-lg text-[0.8125rem] text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/40 transition-all"
                />
              </div>
              <div>
                <label className="block text-[0.8125rem] font-medium text-foreground mb-1.5">
                  Apellido
                </label>
                <input
                  type="text"
                  defaultValue="Giménez"
                  className="w-full h-10 px-4 bg-secondary/30 border border-border/50 rounded-lg text-[0.8125rem] text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/40 transition-all"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-[0.8125rem] font-medium text-foreground mb-1.5">
                Email
              </label>
              <input
                type="email"
                defaultValue="laura.g@email.com"
                className="w-full h-10 px-4 bg-secondary/30 border border-border/50 rounded-lg text-[0.8125rem] text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/40 transition-all"
              />
            </div>
            <div className="mb-6">
              <label className="block text-[0.8125rem] font-medium text-foreground mb-1.5">
                Descripción breve
              </label>
              <textarea
                rows={3}
                defaultValue="Contadora independiente especializada en PyMEs del sector comercial."
                className="w-full px-4 py-3 bg-secondary/30 border border-border/50 rounded-lg text-[0.8125rem] text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/40 transition-all resize-none"
              />
            </div>
            <button className="h-10 px-5 bg-primary text-primary-foreground text-[0.8125rem] font-medium rounded-lg hover:bg-primary/90 transition-colors">
              Guardar cambios
            </button>
          </div>
        </div>
      </section>
    </>
  );
}

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Mail, Phone, Building, Inbox } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { getAdminScope } from "@/lib/auth/admin-scope";
import { createAdminClient } from "@/lib/supabase/admin";

type ContactRow = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: "nuevo" | "leido" | "respondido";
  created_at: string;
  brand: { name: string; slug: string } | null;
};

const statusMap: Record<string, { label: string; className: string }> = {
  nuevo: {
    label: "Nuevo",
    className: "bg-orange-50 text-orange-600 border-orange-200",
  },
  leido: { label: "Leído", className: "bg-gray-50 text-gray-600 border-gray-200" },
  respondido: {
    label: "Respondido",
    className: "bg-green-50 text-green-700 border-green-200",
  },
};

export default async function ConsultasAdmin() {
  const scope = await getAdminScope();
  if (scope.kind === "none") return null;
  const supabase = createAdminClient();
  let query = supabase
    .from("contact_messages")
    .select(
      `id, full_name, email, phone, subject, message, status, created_at,
       brand:brands ( name, slug )`
    )
    .order("created_at", { ascending: false });
  if (scope.brand) query = query.eq("brand_id", scope.brand.id);
  const { data } = await query;

  const rows = (data ?? []) as unknown as ContactRow[];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground font-serif tracking-tight">
          Consultas recibidas
        </h1>
        <p className="mt-1 text-[0.875rem] text-muted-foreground">
          Mensajes enviados desde el formulario de contacto público
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="bg-card border border-border/50 rounded-xl">
          <EmptyState
            icon={<Inbox className="h-6 w-6" />}
            title="Sin consultas todavía"
            description="Cuando alguien envíe el formulario de contacto, va a aparecer acá."
          />
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((row) => {
            const status = statusMap[row.status] ?? statusMap.nuevo;
            const when = format(new Date(row.created_at), "d 'de' MMMM yyyy 'a las' HH:mm", {
              locale: es,
            });
            return (
              <div key={row.id} className="bg-card border border-border/50 rounded-xl p-5">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-[0.9375rem] font-semibold text-foreground">
                        {row.subject}
                      </h3>
                      <Badge variant="outline" className={`text-[0.6875rem] ${status.className}`}>
                        {status.label}
                      </Badge>
                    </div>
                    <p className="text-[0.75rem] text-muted-foreground/60">{when}</p>
                  </div>
                  {row.brand && (
                    <Badge variant="secondary" className="text-[0.6875rem]">
                      {row.brand.name}
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[0.8125rem] text-muted-foreground mt-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Building className="h-3.5 w-3.5 text-muted-foreground/50" />
                    <span className="font-medium text-foreground">{row.full_name}</span>
                  </div>
                  <a
                    href={`mailto:${row.email}`}
                    className="flex items-center gap-2 hover:text-foreground transition-colors"
                  >
                    <Mail className="h-3.5 w-3.5 text-muted-foreground/50" />
                    {row.email}
                  </a>
                  {row.phone && (
                    <a
                      href={`tel:${row.phone}`}
                      className="flex items-center gap-2 hover:text-foreground transition-colors"
                    >
                      <Phone className="h-3.5 w-3.5 text-muted-foreground/50" />
                      {row.phone}
                    </a>
                  )}
                </div>

                <div className="bg-secondary/30 border border-border/40 rounded-lg p-4">
                  <p className="text-[0.8125rem] text-foreground whitespace-pre-line leading-relaxed">
                    {row.message}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

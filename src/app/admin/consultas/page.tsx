import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Mail, Phone, Building, Inbox, Paperclip, FileText, Download } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import { getAdminScope } from "@/lib/auth/admin-scope";
import { paginate } from "@/lib/paginate";
import { createAdminClient } from "@/lib/supabase/admin";

type ContactRow = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  tax_id: string | null;
  subject: string;
  message: string;
  status: "nuevo" | "leido" | "respondido";
  created_at: string;
  attachment_url: string | null;
  attachment_name: string | null;
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

export default async function ConsultasAdmin({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  const { page: pageParam } = await searchParams;
  const scope = await getAdminScope();
  if (scope.kind === "none") return null;
  const supabase = createAdminClient();
  let query = supabase
    .from("contact_messages")
    .select(
      `id, full_name, email, phone, tax_id, subject, message, status, created_at,
       attachment_url, attachment_name,
       brand:brands ( name, slug )`
    )
    .order("created_at", { ascending: false });
  if (scope.brand) query = query.eq("brand_id", scope.brand.id);
  const { data } = await query;

  const allRows = (data ?? []) as unknown as ContactRow[];
  const { items: rows, total, page, totalPages } = paginate(allRows, pageParam, 12);

  // Generar signed URLs en batch para los attachments de la página actual
  const attachmentPaths = rows
    .map((r) => r.attachment_url)
    .filter((p): p is string => Boolean(p));
  const signedUrlByPath = new Map<string, string>();
  if (attachmentPaths.length > 0) {
    const { data: signed } = await supabase.storage
      .from("contact-attachments")
      .createSignedUrls(attachmentPaths, 60 * 60);
    for (const item of signed ?? []) {
      if (item.path && item.signedUrl) {
        signedUrlByPath.set(item.path, item.signedUrl);
      }
    }
  }

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
                  {row.tax_id && (
                    <div className="flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5 text-muted-foreground/50" />
                      <span>
                        <span className="text-muted-foreground/70">RUC/CUIT:</span>{" "}
                        <span className="font-medium text-foreground">{row.tax_id}</span>
                      </span>
                    </div>
                  )}
                </div>

                <div className="bg-secondary/30 border border-border/40 rounded-lg p-4">
                  <p className="text-[0.8125rem] text-foreground whitespace-pre-line leading-relaxed">
                    {row.message}
                  </p>
                </div>

                {row.attachment_url &&
                  (() => {
                    const signedUrl = signedUrlByPath.get(row.attachment_url);
                    if (!signedUrl) return null;
                    const fallbackName =
                      row.attachment_url.split("/").pop() ?? "documento";
                    const displayName = row.attachment_name ?? fallbackName;
                    return (
                      <div className="mt-3 flex items-center gap-2 text-[0.8125rem]">
                        <Paperclip className="h-3.5 w-3.5 text-muted-foreground/50" />
                        <a
                          href={signedUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          download={displayName}
                          className="inline-flex items-center gap-1.5 text-foreground hover:underline"
                        >
                          <Download className="h-3.5 w-3.5" />
                          <span>Descargar documento</span>
                          <span className="text-muted-foreground">({displayName})</span>
                        </a>
                      </div>
                    );
                  })()}
              </div>
            );
          })}
        </div>
      )}

      {rows.length > 0 && totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between text-[0.75rem] text-muted-foreground">
          <span>
            Mostrando {(page - 1) * 12 + 1}–{Math.min(page * 12, total)} de {total}
          </span>
          <Pagination current={page} total={totalPages} />
        </div>
      )}
    </div>
  );
}

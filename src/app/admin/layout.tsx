import { getAdminScope } from "@/lib/auth/admin-scope";
import AdminGuard from "./AdminGuard";
import AdminShell from "./AdminShell";

// Todo el admin es siempre fresh: no se cachea ni se prerendera.
// Necesario para que las mutaciones (crear/editar/borrar) se reflejen sin F5.
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const scope = await getAdminScope();
  return (
    <AdminGuard>
      <AdminShell
        scopeKind={scope.kind === "none" ? "none" : scope.kind}
        scopeBrand={scope.kind !== "none" ? scope.brand : null}
      >
        {children}
      </AdminShell>
    </AdminGuard>
  );
}

import { getAdminScope } from "@/lib/auth/admin-scope";
import AdminGuard from "./AdminGuard";
import AdminShell from "./AdminShell";

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

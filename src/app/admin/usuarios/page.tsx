import Link from "next/link";
import { Shield, MoreHorizontal, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { SearchBar } from "@/components/shared/search-bar";
import { roleConfig } from "@/lib/mock-data";
import { getAllUsersAdmin, type AdminUserRoleFilter } from "@/lib/queries/users";

const FILTERS: { label: string; value: AdminUserRoleFilter; href: string }[] = [
  { label: "Todos", value: "all", href: "/admin/usuarios" },
  { label: "Administradores", value: "admin", href: "/admin/usuarios?role=admin" },
  { label: "Usuarios", value: "user", href: "/admin/usuarios?role=user" },
];

function parseRoleFilter(value: string | string[] | undefined): AdminUserRoleFilter {
  if (value === "admin" || value === "user") return value;
  return "all";
}

export default async function UsuariosAdmin({
  searchParams,
}: {
  searchParams: Promise<{ role?: string | string[] }>;
}) {
  const { role } = await searchParams;
  const activeFilter = parseRoleFilter(role);
  const users = await getAllUsersAdmin(activeFilter);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground font-serif tracking-tight">
            Usuarios
          </h1>
          <p className="mt-1 text-[0.875rem] text-muted-foreground">
            Gestión de usuarios registrados en la plataforma
          </p>
        </div>
        <div className="flex items-center gap-2 text-[0.8125rem] text-muted-foreground">
          <Shield className="h-4 w-4" />
          <span>{users.length} usuarios registrados</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        <SearchBar placeholder="Buscar usuarios..." className="w-full sm:w-72" />
        <div className="flex items-center gap-2">
          {FILTERS.map((filter) => {
            const isActive = filter.value === activeFilter;
            return (
              <Link
                key={filter.value}
                href={filter.href}
                className={`h-8 px-3 inline-flex items-center text-[0.75rem] font-medium rounded-md transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                }`}
              >
                {filter.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Table / Empty */}
      {users.length === 0 ? (
        <div className="bg-card border border-border/50 rounded-xl">
          <EmptyState
            icon={<Users className="h-6 w-6" />}
            title="Sin usuarios para mostrar"
            description="No se encontraron usuarios que coincidan con el filtro seleccionado."
          />
        </div>
      ) : (
        <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left px-5 py-3 text-[0.75rem] font-semibold text-muted-foreground uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="text-left px-5 py-3 text-[0.75rem] font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                    Rol
                  </th>
                  <th className="text-left px-5 py-3 text-[0.75rem] font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                    Registro
                  </th>
                  <th className="text-left px-5 py-3 text-[0.75rem] font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">
                    Última actividad
                  </th>
                  <th className="text-left px-5 py-3 text-[0.75rem] font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                    Actividad
                  </th>
                  <th className="w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {users.map((user) => {
                  const role = roleConfig[user.role as keyof typeof roleConfig];
                  return (
                    <tr key={user.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center shrink-0">
                            <span className="text-[0.6875rem] font-semibold text-muted-foreground">
                              {user.avatar}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-[0.8125rem] font-medium text-foreground">
                              {user.name}
                            </h3>
                            <p className="text-[0.75rem] text-muted-foreground/60">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell">
                        <Badge variant="outline" className={`text-[0.6875rem] ${role.className}`}>
                          {role.label}
                        </Badge>
                      </td>
                      <td className="px-5 py-4 text-[0.8125rem] text-muted-foreground/60 hidden lg:table-cell">
                        {user.joined}
                      </td>
                      <td className="px-5 py-4 text-[0.8125rem] text-muted-foreground/60 hidden sm:table-cell">
                        {user.lastActive}
                      </td>
                      <td className="px-5 py-4 text-[0.75rem] text-muted-foreground/60 hidden lg:table-cell">
                        <span>
                          {user.comments} comentarios · {user.threads} hilos
                        </span>
                      </td>
                      <td className="px-3 py-4">
                        <button className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground/60 hover:text-foreground hover:bg-secondary/60 transition-colors">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

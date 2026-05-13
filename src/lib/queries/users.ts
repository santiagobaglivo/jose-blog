import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

import { getAdminScope } from "@/lib/auth/admin-scope";
import { getBrandContext } from "@/lib/auth/brand-context";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { Author } from "@/types/blog";

export type AdminUserRoleFilter = "all" | "admin" | "user";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: "admin" | "usuario";
  joined: string;
  lastActive: string;
  comments: number;
  threads: number;
}

function getInitials(name: string, fallbackEmail: string | null | undefined) {
  const source = name.trim() || fallbackEmail?.split("@")[0] || "";
  if (!source) return "U";
  const parts = source.split(/\s+/).filter(Boolean);
  const initials = parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}` : source.slice(0, 2);
  return initials.toUpperCase();
}

function formatJoined(createdAt: string) {
  return format(new Date(createdAt), "MMMM yyyy", { locale: es }).replace(/^./, (c) =>
    c.toUpperCase()
  );
}

function formatLastActive(lastSignInAt: string | null | undefined) {
  if (!lastSignInAt) return "Nunca";
  return formatDistanceToNow(new Date(lastSignInAt), { locale: es, addSuffix: true });
}

export async function getAllUsersAdmin(
  roleFilter: AdminUserRoleFilter = "all"
): Promise<AdminUser[]> {
  const scope = await getAdminScope();
  if (scope.kind === "none") return [];

  const supabase = await createClient();
  let query = supabase
    .from("profiles")
    .select("id, display_name, role, created_at, brand_id")
    .order("created_at", { ascending: false });

  if (roleFilter !== "all") {
    query = query.eq("role", roleFilter);
  }

  // Admin local solo ve users de SU brand (incluyendo a sí mismo).
  // Super en brand subdomain ve users de esa brand.
  // Super sin brand ve todos.
  if (scope.brand) query = query.eq("brand_id", scope.brand.id);

  const { data: profiles, error } = await query;
  if (error || !profiles) return [];

  const adminClient = createAdminClient();
  const { data: authData } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const authById = new Map(authData?.users.map((u) => [u.id, u]) ?? []);

  return profiles.map((profile) => {
    const authUser = authById.get(profile.id);
    const email = authUser?.email ?? "";
    return {
      id: profile.id,
      name: profile.display_name,
      email,
      avatar: getInitials(profile.display_name, email),
      role: profile.role === "admin" ? "admin" : "usuario",
      joined: formatJoined(profile.created_at),
      lastActive: formatLastActive(authUser?.last_sign_in_at),
      comments: 0,
      threads: 0,
    };
  });
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return (parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}` : name.slice(0, 2)).toUpperCase();
}

// Equipo profesional mostrado en la página "Sobre nosotros" de cada brand.
// Prioridad:
//   1) brand_team activos de la brand actual (cargados por el admin desde el panel).
//   2) Fallback: admins de la brand + admins globales (comportamiento histórico),
//      para que la sección no quede vacía cuando todavía no se cargó nadie a mano.
export async function getTeamMembers(): Promise<Author[]> {
  const brand = await getBrandContext();
  const supabase = createAdminClient();

  // 1) Intentar primero con brand_team (si hay brand resuelta).
  if (brand) {
    const { data: teamRows } = await supabase
      .from("brand_team")
      .select("member_name, role, photo_url, bio, display_order, is_active")
      .eq("brand_id", brand.id)
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (teamRows && teamRows.length > 0) {
      return teamRows.map((m) => ({
        name: m.member_name,
        role: m.role,
        // Si hay foto se usa la URL; si no, iniciales (Author.avatar admite ambos).
        avatar: m.photo_url ?? initials(m.member_name),
      }));
    }
  }

  // 2) Fallback histórico: admins de la brand + admins globales.
  let query = supabase
    .from("profiles")
    .select("display_name, role, brand_id, bio")
    .eq("role", "admin")
    .order("created_at", { ascending: true });

  if (brand) {
    query = query.or(`brand_id.is.null,brand_id.eq.${brand.id}`);
  } else {
    query = query.is("brand_id", null);
  }

  const { data, error } = await query;
  if (error || !data) return [];

  return data
    .filter((p) => (p.display_name ?? "").trim().length > 0)
    .filter((p) => !["Admin Demo"].includes(p.display_name ?? ""))
    .map((p) => ({
      name: p.display_name ?? "",
      role: (p.bio?.trim() ? p.bio.trim() : "Equipo profesional"),
      avatar: initials(p.display_name ?? ""),
    }));
}

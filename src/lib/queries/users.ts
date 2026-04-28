import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

import { authors, type Author } from "@/lib/mock-data";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

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
  const supabase = await createClient();
  let query = supabase
    .from("profiles")
    .select("id, display_name, role, created_at")
    .order("created_at", { ascending: false });

  if (roleFilter !== "all") {
    query = query.eq("role", roleFilter);
  }

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

export async function getTeamMembers(): Promise<Author[]> {
  return authors;
}

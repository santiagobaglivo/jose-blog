import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { MessageSquare, FileText, Calendar } from "lucide-react";

import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { PerfilForm } from "./perfil-form";

export const metadata: Metadata = {
  title: "Mi perfil | Velázquez & Asociados",
  description: "Gestioná tu información personal y preferencias.",
};

function getInitials(displayName: string, fallback: string | null | undefined) {
  const source = displayName.trim() || fallback?.split("@")[0] || "";
  if (!source) return "U";
  const parts = source.split(/\s+/).filter(Boolean);
  const initials = parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}` : source.slice(0, 2);
  return initials.toUpperCase();
}

export default async function PerfilPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirectedFrom=/perfil");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    redirect("/auth/login?redirectedFrom=/perfil");
  }

  const initials = getInitials(profile.display_name, user.email);
  const memberSince = format(new Date(profile.created_at), "MMMM 'de' yyyy", { locale: es });
  const lastSignIn = user.last_sign_in_at ?? profile.updated_at;
  const lastActivityLabel = format(new Date(lastSignIn), "d MMM", { locale: es });

  // TODO Sprint 3: contar comentarios y hilos reales cuando existan las tablas.
  const commentsCount = 0;
  const threadsCount = 0;

  return (
    <>
      <section className="bg-gradient-to-b from-secondary/40 to-transparent pt-10 pb-8">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Breadcrumbs items={[{ label: "Mi Perfil" }]} />
        </div>
      </section>

      <section className="py-8 lg:py-12">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start gap-6 mb-10">
            <Avatar size="lg" className="size-20 shrink-0">
              {profile.avatar_url ? (
                <AvatarImage src={profile.avatar_url} alt={profile.display_name} />
              ) : null}
              <AvatarFallback className="bg-primary text-primary-foreground text-xl font-semibold font-serif">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-2xl font-semibold text-foreground">{profile.display_name}</h1>
              <p className="text-[0.875rem] text-muted-foreground mt-1">
                Miembro desde {memberSince}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge
                  variant={profile.role === "admin" ? "default" : "secondary"}
                  className="text-[0.75rem] capitalize"
                >
                  {profile.role === "admin" ? "Administrador" : "Usuario"}
                </Badge>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-10">
            {[
              { icon: MessageSquare, label: "Comentarios", value: String(commentsCount) },
              { icon: FileText, label: "Hilos creados", value: String(threadsCount) },
              { icon: Calendar, label: "Última actividad", value: lastActivityLabel },
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

          <PerfilForm profile={profile} email={user.email ?? null} />
        </div>
      </section>
    </>
  );
}

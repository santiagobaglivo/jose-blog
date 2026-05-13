"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  CalendarClock,
  MessageSquare,
  Mail,
  Tag,
  MessagesSquare,
  Sparkles,
  Users,
  ArrowLeft,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

import { useUser } from "@/lib/auth/UserProvider";

const nav = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Marcas", href: "/admin/marcas", icon: Sparkles },
  { name: "Artículos", href: "/admin/articulos", icon: FileText },
  { name: "Programados", href: "/admin/programados", icon: CalendarClock },
  { name: "Comentarios", href: "/admin/comentarios", icon: MessageSquare },
  { name: "Categorías & Tags", href: "/admin/categorias", icon: Tag },
  { name: "Foros", href: "/admin/foros", icon: MessagesSquare },
  { name: "Consultas", href: "/admin/consultas", icon: Mail },
  { name: "Usuarios", href: "/admin/usuarios", icon: Users },
];

function getInitials(name: string | null | undefined, email: string | null | undefined): string {
  const source = (name?.trim() || email?.split("@")[0] || "").trim();
  if (!source) return "AD";
  const parts = source.split(/\s+/).filter(Boolean);
  const initials = parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}` : source.slice(0, 2);
  return initials.toUpperCase();
}

type ScopeBrand = { id: string; slug: string; name: string } | null;

export default function AdminShell({
  children,
  scopeKind,
  scopeBrand,
}: {
  children: React.ReactNode;
  scopeKind: "super" | "local" | "none";
  scopeBrand: ScopeBrand;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, profile } = useUser();
  const adminName = profile?.display_name?.trim() || user?.email || "Admin";
  const adminInitials = getInitials(profile?.display_name, user?.email);

  // Admin local no gestiona la lista de marcas: en su lugar, "Mi marca" lo lleva
  // directo a la pantalla de edición de su brand. Super-admin ve "Marcas".
  const visibleNav = nav.map((item) => {
    if (item.href === "/admin/marcas" && scopeKind === "local" && scopeBrand) {
      return {
        ...item,
        name: "Mi marca",
        href: `/admin/marcas/${scopeBrand.id}`,
      };
    }
    return item;
  });

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border/50 flex flex-col transition-transform duration-300 lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-border/50">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-[0.8125rem] font-semibold text-foreground">Panel admin</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Brand/scope hint */}
        {scopeBrand && (
          <div className="px-5 py-3 border-b border-border/50 bg-secondary/30">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-widest text-muted-foreground/70">
              {scopeKind === "super" ? "Gestionando marca" : "Tu marca"}
            </p>
            <p className="mt-0.5 text-[0.8125rem] font-medium text-foreground truncate">
              {scopeBrand.name}
            </p>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
          {visibleNav.map((item) => {
            const isActive =
              item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-[0.8125rem] font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Back to site */}
        <div className="p-3 border-t border-border/50">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-[0.8125rem] text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al sitio
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-border/50 bg-card shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden h-9 w-9 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground text-[0.6875rem] font-semibold">
                {adminInitials}
              </span>
            </div>
            <span className="text-[0.8125rem] font-medium text-foreground hidden sm:block">
              {adminName}
            </span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

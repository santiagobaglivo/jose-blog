"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Inicio", href: "/" },
  { name: "Sobre el Estudio", href: "/sobre-nosotros" },
  { name: "Blog", href: "/blog" },
  { name: "Foros", href: "/foros" },
  { name: "Contacto", href: "/contacto" },
];

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAdmin = pathname.startsWith("/admin");
  if (isAdmin) return null;

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-border/50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between lg:h-18">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center transition-transform group-hover:scale-105">
              <span className="text-primary-foreground font-serif font-bold text-sm">V</span>
            </div>
            <div className="hidden sm:block">
              <span className="text-[0.9375rem] font-semibold tracking-tight text-foreground">
                Velázquez & Asociados
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navigation.map((item) => {
              const isActive =
                item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative px-4 py-2 text-[0.8125rem] font-medium rounded-md transition-colors",
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                  )}
                >
                  {item.name}
                  {isActive && (
                    <motion.div
                      layoutId="header-active"
                      className="absolute inset-x-2 -bottom-[1.125rem] h-[2px] bg-primary rounded-full"
                      transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <Link
              href="/blog"
              className="hidden lg:flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
              aria-label="Buscar"
            >
              <Search className="h-4 w-4" />
            </Link>
            <Link
              href="/admin"
              className="hidden lg:inline-flex h-9 px-4 items-center justify-center rounded-md bg-primary text-primary-foreground text-[0.8125rem] font-medium hover:bg-primary/90 transition-colors"
            >
              Panel
            </Link>

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden h-9 w-9 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
              aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="lg:hidden overflow-hidden border-t border-border/50 bg-white/95 backdrop-blur-xl"
          >
            <nav className="flex flex-col px-6 py-4 gap-1">
              {navigation.map((item) => {
                const isActive =
                  item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "px-4 py-2.5 text-[0.875rem] font-medium rounded-md transition-colors",
                      isActive
                        ? "text-foreground bg-secondary/60"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                    )}
                  >
                    {item.name}
                  </Link>
                );
              })}
              <div className="border-t border-border/50 mt-2 pt-3">
                <Link
                  href="/admin"
                  onClick={() => setMobileOpen(false)}
                  className="flex h-10 items-center justify-center rounded-md bg-primary text-primary-foreground text-[0.875rem] font-medium hover:bg-primary/90 transition-colors"
                >
                  Acceder al Panel
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

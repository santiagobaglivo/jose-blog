import Link from "next/link";

const links = {
  estudio: [
    { name: "Inicio", href: "/" },
    { name: "Sobre el Estudio", href: "/sobre-nosotros" },
    { name: "Blog", href: "/blog" },
    { name: "Contacto", href: "/contacto" },
  ],
  servicios: [
    { name: "Impuestos", href: "/blog?cat=impuestos" },
    { name: "Contabilidad", href: "/blog?cat=contabilidad" },
    { name: "Empresas", href: "/blog?cat=empresas" },
    { name: "Laboral & RRHH", href: "/blog?cat=laboral" },
  ],
  comunidad: [
    { name: "Foros", href: "/foros" },
    { name: "Actividad Reciente", href: "/foros" },
    { name: "Consultas Generales", href: "/foros" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground/80 mt-auto">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-9 w-9 rounded-lg bg-white/10 flex items-center justify-center">
                <span className="text-white font-serif font-bold text-sm">V</span>
              </div>
              <span className="text-[0.9375rem] font-semibold text-white tracking-tight">
                Velázquez & Asociados
              </span>
            </div>
            <p className="text-[0.8125rem] leading-relaxed text-primary-foreground/60 max-w-xs">
              Más de 20 años brindando soluciones contables, impositivas y de
              consultoría empresarial con excelencia profesional.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-primary-foreground/40 mb-4 font-sans">
                {title === "estudio"
                  ? "Estudio"
                  : title === "servicios"
                  ? "Áreas"
                  : "Comunidad"}
              </h4>
              <ul className="space-y-2.5">
                {items.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-[0.8125rem] text-primary-foreground/60 hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-primary-foreground/40">
            © 2026 Velázquez & Asociados. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-4">
            {["LinkedIn", "Twitter", "Email"].map((social) => (
              <button
                key={social}
                className="text-xs text-primary-foreground/40 hover:text-white transition-colors"
              >
                {social}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

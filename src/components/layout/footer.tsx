import Link from "next/link";

export interface FooterBrand {
  name: string;
  slug: string;
  tagline: string | null;
  accentColor: string | null;
}

const navLinks = [
  { name: "Inicio", href: "/" },
  { name: "Sobre nosotros", href: "/sobre-nosotros" },
  { name: "Blog", href: "/blog" },
  { name: "Contacto", href: "/contacto" },
];

const communityLinks = [
  { name: "Foros", href: "/foros" },
  { name: "Mi cuenta", href: "/perfil" },
];

export function Footer({ brand }: { brand?: FooterBrand }) {
  const brandName = brand?.name ?? "Estudio";
  const brandInitial = brand?.name?.charAt(0).toUpperCase() ?? "E";
  const brandAccent = brand?.accentColor;
  const tagline = brand?.tagline;
  const year = new Date().getFullYear();

  return (
    <footer className="bg-primary text-primary-foreground/80 mt-auto">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="h-9 w-9 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: brandAccent ?? "rgba(255,255,255,0.1)" }}
              >
                <span className="text-white font-serif font-bold text-sm">{brandInitial}</span>
              </div>
              <span className="text-[0.9375rem] font-semibold text-white tracking-tight">
                {brandName}
              </span>
            </div>
            {tagline && (
              <p className="text-[0.8125rem] leading-relaxed text-primary-foreground/60 max-w-xs">
                {tagline}
              </p>
            )}
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-primary-foreground/40 mb-4 font-sans">
              Sitio
            </h4>
            <ul className="space-y-2.5">
              {navLinks.map((link) => (
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

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-primary-foreground/40 mb-4 font-sans">
              Comunidad
            </h4>
            <ul className="space-y-2.5">
              {communityLinks.map((link) => (
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
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-primary-foreground/40">
            © {year} {brandName}. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/contacto"
              className="text-xs text-primary-foreground/40 hover:text-white transition-colors"
            >
              Contacto
            </Link>
            <Link
              href="/sobre-nosotros"
              className="text-xs text-primary-foreground/40 hover:text-white transition-colors"
            >
              Sobre nosotros
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

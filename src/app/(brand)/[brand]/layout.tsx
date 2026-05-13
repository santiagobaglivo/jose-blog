import { notFound } from "next/navigation";

import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { getBrandContext } from "@/lib/auth/brand-context";
import { getBrandBySlug } from "@/lib/queries/brands";

export default async function BrandLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ brand: string }>;
}) {
  // Camino normal: el proxy ya resolvió el brand desde el host y lo dejó en headers.
  // Fallback dev: si se accede via path directo (localhost:3000/escudo-tributario/...),
  // resolver desde params.
  const ctx = await getBrandContext();

  let resolved: {
    id: string;
    slug: string;
    name: string;
    tagline: string | null;
    accentColor: string | null;
  };

  if (ctx) {
    // Header context no trae tagline; lo levantamos a parte para el Footer.
    const fromDb = await getBrandBySlug(ctx.slug);
    resolved = {
      id: ctx.id,
      slug: ctx.slug,
      name: ctx.name,
      tagline: fromDb?.tagline ?? null,
      accentColor: ctx.accentColor,
    };
  } else {
    const { brand: slug } = await params;
    const fromDb = await getBrandBySlug(slug);
    if (!fromDb) notFound();
    resolved = {
      id: fromDb.id,
      slug: fromDb.slug,
      name: fromDb.name,
      tagline: fromDb.tagline,
      accentColor: fromDb.accent_color,
    };
  }

  const accent = resolved.accentColor ?? "#1e3a5f";

  return (
    <div style={{ "--brand-accent": accent } as React.CSSProperties}>
      <Header
        brand={{ name: resolved.name, slug: resolved.slug, accentColor: resolved.accentColor }}
      />
      <main className="flex-1">{children}</main>
      <Footer
        brand={{
          name: resolved.name,
          slug: resolved.slug,
          tagline: resolved.tagline,
          accentColor: resolved.accentColor,
        }}
      />
    </div>
  );
}

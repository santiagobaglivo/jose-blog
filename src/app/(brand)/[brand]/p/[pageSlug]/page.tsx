import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { PostImage } from "@/components/shared/post-image";
import { requireBrandContext } from "@/lib/auth/brand-context";
import { getBrandPageBySlug } from "@/lib/queries/brand-pages";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ brand: string; pageSlug: string }>;
}): Promise<Metadata> {
  const { brand, pageSlug } = await params;
  const page = await getBrandPageBySlug(brand, pageSlug);
  if (!page) return { title: "Página no encontrada" };
  return {
    title: page.seo_title ?? page.title,
    description: page.seo_description ?? page.subtitle ?? undefined,
  };
}

export default async function BrandCustomPage({
  params,
}: {
  params: Promise<{ brand: string; pageSlug: string }>;
}) {
  const { pageSlug } = await params;
  const brand = await requireBrandContext();
  const page = await getBrandPageBySlug(brand.slug, pageSlug);
  if (!page) notFound();

  return (
    <>
      <section className="bg-gradient-to-b from-secondary/40 to-transparent pt-10 pb-8">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Breadcrumbs items={[{ label: page.title }]} />
        </div>
      </section>

      <section className="py-8 lg:py-12">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <article>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-foreground tracking-tight leading-[1.15]">
              {page.title}
            </h1>

            {page.subtitle && (
              <p className="mt-4 text-[1rem] sm:text-[1.0625rem] text-muted-foreground">
                {page.subtitle}
              </p>
            )}

            {page.hero_image && page.hero_image.trim() && (
              <div className="mt-8 rounded-xl overflow-hidden aspect-[2/1] bg-secondary relative">
                <PostImage src={page.hero_image} alt={page.title} priority />
              </div>
            )}

            {page.content_html && page.content_html.trim() ? (
              <div
                className="mt-10 prose-premium max-w-none"
                dangerouslySetInnerHTML={{ __html: page.content_html }}
              />
            ) : null}
          </article>
        </div>
      </section>
    </>
  );
}

-- Brand pages: páginas CMS-lite por brand. El admin crea páginas arbitrarias
-- (título + HTML sanitizado) y pueden aparecer dinámicamente en el nav público.
-- MVP sin block editor: contenido HTML editable + preview.

CREATE TABLE public.brand_pages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id uuid NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  slug text NOT NULL CHECK (char_length(slug) BETWEEN 1 AND 80),
  title text NOT NULL CHECK (char_length(title) BETWEEN 2 AND 200),
  subtitle text,
  content_html text NOT NULL DEFAULT '',
  hero_image text,
  show_in_menu boolean NOT NULL DEFAULT true,
  menu_order int NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  seo_title text,
  seo_description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE (brand_id, slug)
);

CREATE INDEX idx_brand_pages_brand ON public.brand_pages(brand_id);
CREATE INDEX idx_brand_pages_menu ON public.brand_pages(brand_id, menu_order)
  WHERE show_in_menu AND status = 'published' AND deleted_at IS NULL;

ALTER TABLE public.brand_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "brand_pages_select_published" ON public.brand_pages FOR SELECT USING (
  (status = 'published' AND deleted_at IS NULL
   AND EXISTS (SELECT 1 FROM public.brands b WHERE b.id = brand_pages.brand_id AND b.is_active AND b.deleted_at IS NULL))
  OR public.is_admin_of(brand_id)
);

CREATE POLICY "brand_pages_admin_all" ON public.brand_pages FOR ALL
  USING (public.is_admin_of(brand_id))
  WITH CHECK (public.is_admin_of(brand_id));

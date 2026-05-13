-- Brand testimonials: testimonios de clientes por marca, mostrados como carrusel
-- en la home pública. Editables desde el panel admin de la propia brand.
-- Mismo patrón que brand_slides / brand_stats / brand_team: tabla por brand,
-- RLS de lectura pública si la brand está activa, escritura para admin de la brand.

CREATE TABLE IF NOT EXISTS public.brand_testimonials (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id uuid NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  author_name text NOT NULL CHECK (char_length(author_name) BETWEEN 2 AND 120),
  author_role text,
  author_company text,
  author_photo_url text,
  quote text NOT NULL CHECK (char_length(quote) BETWEEN 10 AND 1000),
  rating int CHECK (rating BETWEEN 1 AND 5),
  display_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_brand_testimonials_brand
  ON public.brand_testimonials(brand_id);

CREATE INDEX IF NOT EXISTS idx_brand_testimonials_order
  ON public.brand_testimonials(brand_id, display_order)
  WHERE is_active;

-- RLS
ALTER TABLE public.brand_testimonials ENABLE ROW LEVEL SECURITY;

-- Public puede leer testimonios si la marca está activa.
DROP POLICY IF EXISTS "brand_testimonials_select_with_brand" ON public.brand_testimonials;
CREATE POLICY "brand_testimonials_select_with_brand" ON public.brand_testimonials
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.brands b
      WHERE b.id = brand_testimonials.brand_id
        AND b.is_active = true
        AND b.deleted_at IS NULL
    )
    OR public.is_admin_of(brand_id)
  );

-- Admin de la brand (super o local) gestiona los testimonios.
DROP POLICY IF EXISTS "brand_testimonials_admin_all" ON public.brand_testimonials;
CREATE POLICY "brand_testimonials_admin_all" ON public.brand_testimonials
  FOR ALL
  USING (public.is_admin_of(brand_id))
  WITH CHECK (public.is_admin_of(brand_id));

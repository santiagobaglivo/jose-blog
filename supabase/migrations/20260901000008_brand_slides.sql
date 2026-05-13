-- Brand slides: slides editables del hero/carrusel de portada de cada marca.
-- Cada slide se renderiza en la home pública de la brand (carousel auto-rotate).
-- Si una brand no tiene slides activos, la home muestra el hero estático que ya tenía.

CREATE TABLE IF NOT EXISTS public.brand_slides (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id uuid NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  title text NOT NULL CHECK (char_length(title) BETWEEN 2 AND 200),
  subtitle text CHECK (subtitle IS NULL OR char_length(subtitle) <= 400),
  image_url text,
  cta_label text CHECK (cta_label IS NULL OR char_length(cta_label) <= 80),
  cta_href text CHECK (cta_href IS NULL OR char_length(cta_href) <= 500),
  display_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_brand_slides_brand
  ON public.brand_slides(brand_id);

CREATE INDEX IF NOT EXISTS idx_brand_slides_brand_order
  ON public.brand_slides(brand_id, display_order)
  WHERE is_active;

-- RLS
ALTER TABLE public.brand_slides ENABLE ROW LEVEL SECURITY;

-- Public puede leer slides activos si la marca está activa (mismo patrón que brand_services).
DROP POLICY IF EXISTS "brand_slides_select_with_brand" ON public.brand_slides;
CREATE POLICY "brand_slides_select_with_brand" ON public.brand_slides
  FOR SELECT USING (
    (
      is_active = true
      AND EXISTS (
        SELECT 1 FROM public.brands b
        WHERE b.id = brand_slides.brand_id
          AND b.is_active = true
          AND b.deleted_at IS NULL
      )
    )
    OR public.is_admin_of(brand_id)
  );

-- Admin de la brand (super o local) gestiona los slides.
DROP POLICY IF EXISTS "brand_slides_admin_all" ON public.brand_slides;
CREATE POLICY "brand_slides_admin_all" ON public.brand_slides
  FOR ALL
  USING (public.is_admin_of(brand_id))
  WITH CHECK (public.is_admin_of(brand_id));

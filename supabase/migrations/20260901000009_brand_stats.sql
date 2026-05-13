-- Brand stats: contadores/cifras editables por marca para destacar números clave
-- en la home pública ("+14K colaboradores", "37 años de experiencia", etc.).
-- Cada brand puede tener N stats con label, value (texto, no número, para
-- soportar formatos como "14K"/"37"/"+200"), un suffix opcional y orden.

CREATE TABLE IF NOT EXISTS public.brand_stats (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id uuid NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  label text NOT NULL CHECK (char_length(label) BETWEEN 2 AND 100),
  value text NOT NULL CHECK (char_length(value) BETWEEN 1 AND 30),
  suffix text,
  display_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_brand_stats_brand
  ON public.brand_stats(brand_id);

CREATE INDEX IF NOT EXISTS idx_brand_stats_order
  ON public.brand_stats(brand_id, display_order)
  WHERE is_active;

-- RLS
ALTER TABLE public.brand_stats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "brand_stats_select_with_brand" ON public.brand_stats;
CREATE POLICY "brand_stats_select_with_brand" ON public.brand_stats
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.brands b
      WHERE b.id = brand_stats.brand_id
        AND b.is_active
        AND b.deleted_at IS NULL
    )
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "brand_stats_admin_all" ON public.brand_stats;
CREATE POLICY "brand_stats_admin_all" ON public.brand_stats
  FOR ALL
  USING (public.is_admin_of(brand_id))
  WITH CHECK (public.is_admin_of(brand_id));

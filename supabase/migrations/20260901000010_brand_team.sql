-- Brand team: listado de miembros del equipo profesional editable por marca.
-- Reemplaza el fallback histórico que mostraba a los profiles con role=admin como "equipo".
-- Si una brand carga miembros activos, esos se muestran en /sobre-nosotros; si no,
-- se mantiene el fallback a admins de la brand para no dejar la sección vacía.

CREATE TABLE IF NOT EXISTS public.brand_team (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id uuid NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  member_name text NOT NULL CHECK (char_length(member_name) BETWEEN 2 AND 120),
  role text NOT NULL CHECK (char_length(role) BETWEEN 2 AND 120),
  photo_url text,
  bio text CHECK (bio IS NULL OR char_length(bio) <= 800),
  display_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_brand_team_brand
  ON public.brand_team(brand_id);

CREATE INDEX IF NOT EXISTS idx_brand_team_order
  ON public.brand_team(brand_id, display_order)
  WHERE is_active;

-- RLS
ALTER TABLE public.brand_team ENABLE ROW LEVEL SECURITY;

-- Public puede leer miembros si la marca está activa (mismo patrón que brand_slides/brand_stats).
DROP POLICY IF EXISTS "brand_team_select_with_brand" ON public.brand_team;
CREATE POLICY "brand_team_select_with_brand" ON public.brand_team
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.brands b
      WHERE b.id = brand_team.brand_id
        AND b.is_active = true
        AND b.deleted_at IS NULL
    )
    OR public.is_admin_of(brand_id)
  );

-- Admin de la brand (super o local) gestiona los miembros.
DROP POLICY IF EXISTS "brand_team_admin_all" ON public.brand_team;
CREATE POLICY "brand_team_admin_all" ON public.brand_team
  FOR ALL
  USING (public.is_admin_of(brand_id))
  WITH CHECK (public.is_admin_of(brand_id));

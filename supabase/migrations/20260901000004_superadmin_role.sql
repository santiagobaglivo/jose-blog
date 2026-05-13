-- Roles: 'user' | 'admin' (local de una brand) | 'superadmin' (transversal).
-- Convención:
--   role='superadmin'         → gestiona TODAS las marcas. brand_id usualmente NULL.
--   role='admin' + brand_id   → gestiona SOLO esa marca.
--   role='user'   + brand_id  → user regular (lectura + commentar + foros) en esa marca.

-- 1. Extender enum.
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'superadmin';

-- 2. Helpers de autorización.
CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'superadmin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin_of(brand uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND (
        p.role = 'superadmin'
        OR (p.role = 'admin' AND p.brand_id = brand)
      )
  );
$$;

-- 3. Redefinir is_admin() para mantener compat: cualquier rol de gestión (super o local).
--    OJO: is_admin() YA NO VALIDA BRAND. Las policies brand-scoped deben usar
--    is_admin_of(<tabla>.brand_id) en su lugar. Lo dejamos como salvavidas.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
  );
$$;

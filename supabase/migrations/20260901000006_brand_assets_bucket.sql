-- Bucket público para logos / hero images de las marcas.
-- Path convention: brand-assets/<brand-slug>/<filename>

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'brand-assets',
  'brand-assets',
  true,
  5242880, -- 5MB
  ARRAY['image/png','image/jpeg','image/jpg','image/webp','image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Public read.
DROP POLICY IF EXISTS "brand_assets_public_read" ON storage.objects;
CREATE POLICY "brand_assets_public_read" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'brand-assets');

-- Cualquier admin (super o local) puede insertar/actualizar/borrar.
-- Por simplicidad MVP no restringimos por brand-path; los uploads van
-- siempre desde el server con scope correcto.
DROP POLICY IF EXISTS "brand_assets_admin_write" ON storage.objects;
CREATE POLICY "brand_assets_admin_write" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'brand-assets' AND public.is_admin());

DROP POLICY IF EXISTS "brand_assets_admin_update" ON storage.objects;
CREATE POLICY "brand_assets_admin_update" ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'brand-assets' AND public.is_admin());

DROP POLICY IF EXISTS "brand_assets_admin_delete" ON storage.objects;
CREATE POLICY "brand_assets_admin_delete" ON storage.objects
  FOR DELETE
  USING (bucket_id = 'brand-assets' AND public.is_admin());

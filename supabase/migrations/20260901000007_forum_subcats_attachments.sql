-- 1) Subcategorías de foro: parent_id self-ref nullable.
--    NULL = categoría raíz. NOT NULL = subcategoría que cuelga del parent.
ALTER TABLE public.forum_categories
  ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES public.forum_categories(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_forum_cats_parent ON public.forum_categories(parent_id);

-- 2) Content de los hilos pasa a ser HTML (lo seguimos sanitizando server-side
--    al insertar/editar). Actualizamos el check de longitud máxima para permitir
--    "informes" largos.
ALTER TABLE public.forum_threads
  DROP CONSTRAINT IF EXISTS forum_threads_content_check;
ALTER TABLE public.forum_threads
  ADD CONSTRAINT forum_threads_content_check
    CHECK (char_length(content) BETWEEN 10 AND 50000);

ALTER TABLE public.forum_replies
  DROP CONSTRAINT IF EXISTS forum_replies_content_check;
ALTER TABLE public.forum_replies
  ADD CONSTRAINT forum_replies_content_check
    CHECK (char_length(content) BETWEEN 2 AND 50000);

-- 3) Bucket forum-attachments para fotos/archivos adjuntos en hilos.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'forum-attachments',
  'forum-attachments',
  true,
  10485760, -- 10MB
  ARRAY['image/png','image/jpeg','image/jpg','image/webp','image/gif','application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "forum_attachments_public_read" ON storage.objects;
CREATE POLICY "forum_attachments_public_read" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'forum-attachments');

-- Cualquier usuario autenticado puede subir attachments al foro.
DROP POLICY IF EXISTS "forum_attachments_authed_write" ON storage.objects;
CREATE POLICY "forum_attachments_authed_write" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'forum-attachments'
    AND auth.uid() IS NOT NULL
  );

DROP POLICY IF EXISTS "forum_attachments_admin_modify" ON storage.objects;
CREATE POLICY "forum_attachments_admin_modify" ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'forum-attachments' AND public.is_admin());

DROP POLICY IF EXISTS "forum_attachments_admin_delete" ON storage.objects;
CREATE POLICY "forum_attachments_admin_delete" ON storage.objects
  FOR DELETE
  USING (bucket_id = 'forum-attachments' AND public.is_admin());

-- 4) Canales de contacto de la marca (botones de "asesoría directa" en posts).
ALTER TABLE public.brands
  ADD COLUMN IF NOT EXISTS whatsapp_number text,
  ADD COLUMN IF NOT EXISTS contact_email text,
  ADD COLUMN IF NOT EXISTS instagram_url text,
  ADD COLUMN IF NOT EXISTS facebook_url text,
  ADD COLUMN IF NOT EXISTS tiktok_url text,
  ADD COLUMN IF NOT EXISTS linkedin_url text,
  ADD COLUMN IF NOT EXISTS twitter_url text;

-- 5) Form de contacto: identificación fiscal (RUC / CUIT) y attachment opcional.
ALTER TABLE public.contact_messages
  ADD COLUMN IF NOT EXISTS tax_id text,
  ADD COLUMN IF NOT EXISTS attachment_url text,
  ADD COLUMN IF NOT EXISTS attachment_name text;

-- 6) Bucket privado para los documentos que adjunten en consultas de contacto.
--    Privado: solo admins pueden leerlo. Los archivos se sirven via signed URL
--    desde /admin/consultas.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'contact-attachments',
  'contact-attachments',
  false,
  10485760, -- 10MB
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Insert anónimo (cualquiera puede mandar consulta con archivo).
DROP POLICY IF EXISTS "contact_attachments_anon_insert" ON storage.objects;
CREATE POLICY "contact_attachments_anon_insert" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'contact-attachments');

-- Solo admin lee/modifica/borra.
DROP POLICY IF EXISTS "contact_attachments_admin_read" ON storage.objects;
CREATE POLICY "contact_attachments_admin_read" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'contact-attachments' AND public.is_admin());

DROP POLICY IF EXISTS "contact_attachments_admin_modify" ON storage.objects;
CREATE POLICY "contact_attachments_admin_modify" ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'contact-attachments' AND public.is_admin());

DROP POLICY IF EXISTS "contact_attachments_admin_delete" ON storage.objects;
CREATE POLICY "contact_attachments_admin_delete" ON storage.objects
  FOR DELETE
  USING (bucket_id = 'contact-attachments' AND public.is_admin());


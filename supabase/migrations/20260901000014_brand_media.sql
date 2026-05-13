-- Brand media: galería multimedia por brand. El admin sube imágenes, videos y
-- documentos al bucket brand-assets, o pega un URL de YouTube/Vimeo para embed.
-- Después puede copiar la URL/embed_html y pegarla en el editor de posts/páginas/foros.

CREATE TABLE public.brand_media (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id uuid NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  uploader_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  kind text NOT NULL CHECK (kind IN ('image', 'video', 'document', 'embed')),
  url text NOT NULL,                 -- URL pública (storage o externa para embed)
  thumbnail_url text,                -- preview para videos/embeds
  title text,
  description text,
  mime_type text,
  size_bytes bigint,
  duration_seconds int,              -- para videos
  embed_provider text,               -- "youtube", "vimeo", "url"
  embed_html text,                   -- iframe HTML pre-armado (para embed)
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_brand_media_brand ON public.brand_media(brand_id);
CREATE INDEX idx_brand_media_kind ON public.brand_media(brand_id, kind);

ALTER TABLE public.brand_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "brand_media_select_public" ON public.brand_media FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.brands b WHERE b.id = brand_media.brand_id AND b.is_active AND b.deleted_at IS NULL)
  OR public.is_admin_of(brand_id)
);

CREATE POLICY "brand_media_admin_all" ON public.brand_media FOR ALL
  USING (public.is_admin_of(brand_id))
  WITH CHECK (public.is_admin_of(brand_id));

-- Ampliar el bucket brand-assets para soportar videos y documentos.
-- El bucket sigue siendo público (lectura) y solo admins escriben (políticas ya existen).
UPDATE storage.buckets
SET
  file_size_limit = 268435456, -- 256MB para permitir videos cortos
  allowed_mime_types = ARRAY[
    'image/png','image/jpeg','image/jpg','image/webp','image/svg+xml','image/gif',
    'video/mp4','video/webm','video/quicktime','video/ogg',
    'application/pdf'
  ]
WHERE id = 'brand-assets';

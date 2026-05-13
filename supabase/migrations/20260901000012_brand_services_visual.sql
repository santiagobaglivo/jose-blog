-- Visual a brand_services: cada servicio puede tener un icono (nombre lucide) o
-- una imagen subida (URL del bucket brand-assets). Si ninguno está seteado,
-- el render público cae a un check default.

ALTER TABLE public.brand_services
  ADD COLUMN IF NOT EXISTS icon text,        -- nombre de icono lucide (ej: "scale", "shield-check")
  ADD COLUMN IF NOT EXISTS image_url text;   -- alternativa a icon: imagen subida

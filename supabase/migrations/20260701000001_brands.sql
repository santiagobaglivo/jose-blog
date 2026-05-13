-- Brands: marcas comerciales del estudio (Escudo Tributario, Tributa Fácil, etc.)
-- Cada marca es una vertical de servicios con landing dedicada.
create table public.brands (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  tagline text,
  hero_image text,
  about_text text not null,            -- "Quiénes somos"
  asesoria_text text,                  -- "Información de la asesoría"
  accent_color text,                   -- hex/oklch para tematización
  display_order int not null default 0,
  is_active boolean not null default true,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index idx_brands_slug on public.brands(slug);
create index idx_brands_active on public.brands(is_active) where deleted_at is null;
create index idx_brands_order on public.brands(display_order);

-- Servicios anidados de cada marca
create table public.brand_services (
  id uuid primary key default uuid_generate_v4(),
  brand_id uuid not null references public.brands(id) on delete cascade,
  name text not null,
  description text,
  display_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_brand_services_brand on public.brand_services(brand_id);
create index idx_brand_services_order on public.brand_services(brand_id, display_order);

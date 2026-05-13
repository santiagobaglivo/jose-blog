-- Multi-marca: cada categoría y tag pertenece a una marca
--
-- Las semillas previas (Monotributo, AFIP, etc.) eran argentinas y no aplican
-- a las marcas peruanas del estudio. Se eliminan; el admin las cargará por marca.

delete from public.categories;
delete from public.tags;

alter table public.categories
  add column brand_id uuid not null references public.brands(id) on delete cascade;

alter table public.tags
  add column brand_id uuid not null references public.brands(id) on delete cascade;

-- slug deja de ser globalmente único: dos marcas pueden tener "tributario"
alter table public.categories drop constraint categories_slug_key;
alter table public.categories
  add constraint categories_slug_brand_unique unique (brand_id, slug);

alter table public.tags drop constraint tags_slug_key;
alter table public.tags
  add constraint tags_slug_brand_unique unique (brand_id, slug);

create index idx_categories_brand on public.categories(brand_id);
create index idx_tags_brand on public.tags(brand_id);

-- el índice global de slug ya no aplica; se reemplaza por el compuesto del unique
drop index if exists public.idx_categories_slug;
drop index if exists public.idx_tags_slug;
create index idx_categories_brand_slug on public.categories(brand_id, slug);
create index idx_tags_brand_slug on public.tags(brand_id, slug);

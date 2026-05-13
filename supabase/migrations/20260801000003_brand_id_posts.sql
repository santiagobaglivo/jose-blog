-- Multi-marca: cada post pertenece a una marca
-- Se asume tabla vacía (sin posts productivos) → NOT NULL directo.

alter table public.posts
  add column brand_id uuid not null references public.brands(id) on delete cascade;

-- slug deja de ser globalmente único: dos marcas pueden tener "/blog/reforma-2026"
alter table public.posts drop constraint posts_slug_key;
alter table public.posts
  add constraint posts_slug_brand_unique unique (brand_id, slug);

create index idx_posts_brand on public.posts(brand_id);
create index idx_posts_brand_status_pub on public.posts(brand_id, status, published_at desc);

-- el índice global de slug ya no aplica; se reemplaza por el compuesto del unique
drop index if exists public.idx_posts_slug;
create index idx_posts_brand_slug on public.posts(brand_id, slug);

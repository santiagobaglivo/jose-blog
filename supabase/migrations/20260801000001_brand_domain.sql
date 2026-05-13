-- Multi-marca / multi-dominio: cada marca puede tener su propio dominio
-- (ej: escudotributario.pe). NULL hasta que se compre y se asigne.
alter table public.brands
  add column domain text unique;

create index idx_brands_domain on public.brands(domain) where domain is not null;

comment on column public.brands.domain is
  'Dominio asociado a la marca (ej: escudotributario.pe). NULL = no asignado todavía. UNIQUE.';

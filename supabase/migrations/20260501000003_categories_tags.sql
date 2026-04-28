create table public.categories (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  description text,
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tags (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  created_at timestamptz not null default now()
);

create index idx_categories_slug on public.categories(slug);
create index idx_tags_slug on public.tags(slug);

-- Seeds iniciales
insert into public.categories (slug, name, description, display_order) values
  ('impuestos', 'Impuestos', 'Novedades impositivas, reformas y guías prácticas', 1),
  ('contabilidad', 'Contabilidad', 'Normativas contables, balances y reportes financieros', 2),
  ('empresas', 'Empresas', 'Constitución, gestión y consultoría empresarial', 3),
  ('laboral', 'Laboral & RRHH', 'Legislación laboral, liquidaciones y convenios', 4),
  ('finanzas', 'Finanzas Personales', 'Planificación financiera, inversiones y patrimonio', 5);

insert into public.tags (slug, name) values
  ('iva','IVA'),
  ('ganancias','Ganancias'),
  ('monotributo','Monotributo'),
  ('pymes','PyMEs'),
  ('balances','Balances'),
  ('afip','AFIP'),
  ('liquidaciones','Liquidaciones'),
  ('inversiones','Inversiones'),
  ('sociedades','Sociedades'),
  ('facturacion','Facturación');

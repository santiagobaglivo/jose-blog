-- Multi-marca: cada usuario puede pertenecer a una marca (comunidad por marca).
-- brand_id NULL = admin global (transversal a todas las marcas).
-- brand_id NOT NULL = usuario regular de esa marca.

alter table public.profiles
  add column brand_id uuid references public.brands(id) on delete set null;

create index idx_profiles_brand on public.profiles(brand_id) where brand_id is not null;

-- El trigger de signup toma brand_id desde raw_user_meta_data.
-- El frontend de cada dominio debe pasarlo en el signUp() (lo resuelve desde el host).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta_brand_id uuid;
begin
  meta_brand_id := nullif(new.raw_user_meta_data->>'brand_id', '')::uuid;

  insert into public.profiles (id, display_name, brand_id)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    meta_brand_id
  );
  return new;
end; $$;

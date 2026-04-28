-- Enable RLS
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.tags enable row level security;

-- Helper: is_admin()
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- profiles policies
create policy "profiles_select_public" on public.profiles
  for select using (true);

create policy "profiles_update_self" on public.profiles
  for update using (auth.uid() = id);

create policy "profiles_admin_update_all" on public.profiles
  for update using (public.is_admin());

-- categories policies
create policy "categories_select_public" on public.categories
  for select using (true);

create policy "categories_admin_all" on public.categories
  for all using (public.is_admin()) with check (public.is_admin());

-- tags policies
create policy "tags_select_public" on public.tags
  for select using (true);

create policy "tags_admin_all" on public.tags
  for all using (public.is_admin()) with check (public.is_admin());

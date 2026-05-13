-- Enable RLS
alter table public.brands enable row level security;
alter table public.brand_services enable row level security;

-- brands policies
create policy "brands_select_active" on public.brands
  for select using (
    (is_active = true and deleted_at is null)
    or public.is_admin()
  );

create policy "brands_admin_all" on public.brands
  for all using (public.is_admin()) with check (public.is_admin());

-- brand_services policies
create policy "brand_services_select_with_brand" on public.brand_services
  for select using (
    (
      is_active = true
      and exists (
        select 1 from public.brands b
        where b.id = brand_services.brand_id
          and b.is_active = true
          and b.deleted_at is null
      )
    )
    or public.is_admin()
  );

create policy "brand_services_admin_all" on public.brand_services
  for all using (public.is_admin()) with check (public.is_admin());

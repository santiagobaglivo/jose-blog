-- Enable RLS
alter table public.posts enable row level security;
alter table public.post_tags enable row level security;

-- posts policies
create policy "posts_select_published" on public.posts
  for select using (
    (status = 'published' and deleted_at is null)
    or public.is_admin()
  );

create policy "posts_admin_all" on public.posts
  for all using (public.is_admin()) with check (public.is_admin());

-- post_tags policies
create policy "post_tags_select_with_post" on public.post_tags
  for select using (
    exists (
      select 1 from public.posts p
      where p.id = post_tags.post_id
        and (
          (p.status = 'published' and p.deleted_at is null)
          or public.is_admin()
        )
    )
  );

create policy "post_tags_admin_all" on public.post_tags
  for all using (public.is_admin()) with check (public.is_admin());

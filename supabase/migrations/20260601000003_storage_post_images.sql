-- Bucket: post-images (public read, admin-only writes)
insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true)
on conflict (id) do nothing;

-- Public read access
create policy "post_images_select_public"
  on storage.objects for select
  using (bucket_id = 'post-images');

-- Admin-only insert
create policy "post_images_insert_admin"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'post-images'
    and public.is_admin()
  );

-- Admin-only update
create policy "post_images_update_admin"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'post-images'
    and public.is_admin()
  )
  with check (
    bucket_id = 'post-images'
    and public.is_admin()
  );

-- Admin-only delete
create policy "post_images_delete_admin"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'post-images'
    and public.is_admin()
  );

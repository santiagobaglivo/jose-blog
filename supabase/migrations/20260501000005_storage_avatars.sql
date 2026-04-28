-- Bucket: avatars (public read, self-managed writes)
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Public read access
create policy "avatars_select_public"
  on storage.objects for select
  using (bucket_id = 'avatars');

-- Authenticated user can upload only inside their own {user_id}/ folder
create policy "avatars_insert_self"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Authenticated user can update only their own files
create policy "avatars_update_self"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Authenticated user can delete only their own files
create policy "avatars_delete_self"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

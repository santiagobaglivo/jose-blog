-- Comentarios sobre posts del blog.
-- Moderación: created como 'pending', admin pasa a 'approved' o 'rejected'.

create type comment_status as enum ('pending', 'approved', 'rejected');

create table public.comments (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid not null references public.posts(id) on delete cascade,
  brand_id uuid not null references public.brands(id) on delete cascade,
  author_id uuid not null references public.profiles(id),
  content text not null check (char_length(content) between 2 and 2000),
  status comment_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index idx_comments_post on public.comments(post_id);
create index idx_comments_status on public.comments(status);
create index idx_comments_brand on public.comments(brand_id);
create index idx_comments_author on public.comments(author_id);
create index idx_comments_post_status on public.comments(post_id, status) where deleted_at is null;

alter table public.comments enable row level security;

-- Público: solo aprobados de posts publicados de marcas activas
create policy "comments_select_approved" on public.comments
  for select using (
    (status = 'approved' and deleted_at is null
     and exists (
       select 1 from public.posts p
       where p.id = comments.post_id
         and p.status = 'published'
         and p.deleted_at is null
     ))
    or public.is_admin()
  );

-- Usuario logueado puede crear su propio comment (queda pending hasta que admin apruebe)
create policy "comments_insert_self" on public.comments
  for insert with check (auth.uid() = author_id);

-- Usuario puede editar su propio comment (mientras no esté borrado)
create policy "comments_update_self" on public.comments
  for update using (auth.uid() = author_id and deleted_at is null);

-- Admin: full control
create policy "comments_admin_all" on public.comments
  for all using (public.is_admin()) with check (public.is_admin());

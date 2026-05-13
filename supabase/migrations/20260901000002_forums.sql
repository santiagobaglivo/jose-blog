-- Foros por marca: cada brand tiene su propio set de categorías, hilos y respuestas.

create table public.forum_categories (
  id uuid primary key default uuid_generate_v4(),
  brand_id uuid not null references public.brands(id) on delete cascade,
  slug text not null,
  name text not null,
  description text,
  icon text,                                -- lucide icon name (ej: "receipt")
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (brand_id, slug)
);

create index idx_forum_cats_brand on public.forum_categories(brand_id);

create table public.forum_threads (
  id uuid primary key default uuid_generate_v4(),
  brand_id uuid not null references public.brands(id) on delete cascade,
  category_id uuid not null references public.forum_categories(id) on delete cascade,
  author_id uuid not null references public.profiles(id),
  slug text not null,
  title text not null check (char_length(title) between 5 and 200),
  content text not null check (char_length(content) between 10 and 10000),
  pinned boolean not null default false,
  view_count int not null default 0,
  reply_count int not null default 0,
  last_reply_at timestamptz,
  last_reply_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (brand_id, slug)
);

create index idx_threads_brand on public.forum_threads(brand_id);
create index idx_threads_category on public.forum_threads(category_id);
create index idx_threads_author on public.forum_threads(author_id);
create index idx_threads_listing
  on public.forum_threads (brand_id, pinned desc, coalesce(last_reply_at, created_at) desc)
  where deleted_at is null;

create table public.forum_replies (
  id uuid primary key default uuid_generate_v4(),
  thread_id uuid not null references public.forum_threads(id) on delete cascade,
  author_id uuid not null references public.profiles(id),
  content text not null check (char_length(content) between 2 and 10000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index idx_replies_thread on public.forum_replies(thread_id);
create index idx_replies_author on public.forum_replies(author_id);
create index idx_replies_thread_active
  on public.forum_replies (thread_id, created_at)
  where deleted_at is null;

-- RLS
alter table public.forum_categories enable row level security;
alter table public.forum_threads enable row level security;
alter table public.forum_replies enable row level security;

-- forum_categories
create policy "forum_cats_select_public" on public.forum_categories
  for select using (
    exists (
      select 1 from public.brands b
      where b.id = forum_categories.brand_id
        and b.is_active = true
        and b.deleted_at is null
    )
    or public.is_admin()
  );
create policy "forum_cats_admin_all" on public.forum_categories
  for all using (public.is_admin()) with check (public.is_admin());

-- forum_threads
create policy "forum_threads_select_public" on public.forum_threads
  for select using (
    (deleted_at is null
     and exists (
       select 1 from public.brands b
       where b.id = forum_threads.brand_id
         and b.is_active = true
         and b.deleted_at is null
     ))
    or public.is_admin()
  );
create policy "forum_threads_insert_authed" on public.forum_threads
  for insert with check (auth.uid() = author_id);
create policy "forum_threads_update_self" on public.forum_threads
  for update using (auth.uid() = author_id and deleted_at is null);
create policy "forum_threads_admin_all" on public.forum_threads
  for all using (public.is_admin()) with check (public.is_admin());

-- forum_replies
create policy "forum_replies_select_public" on public.forum_replies
  for select using (
    (deleted_at is null
     and exists (
       select 1 from public.forum_threads t
       where t.id = forum_replies.thread_id and t.deleted_at is null
     ))
    or public.is_admin()
  );
create policy "forum_replies_insert_authed" on public.forum_replies
  for insert with check (auth.uid() = author_id);
create policy "forum_replies_update_self" on public.forum_replies
  for update using (auth.uid() = author_id and deleted_at is null);
create policy "forum_replies_admin_all" on public.forum_replies
  for all using (public.is_admin()) with check (public.is_admin());

-- Posts: tabla principal con search_vector + indices GIN
create table public.posts (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  title text not null,
  subtitle text,
  excerpt text not null,
  content jsonb not null,           -- TipTap JSON
  content_html text not null,       -- render server-side
  featured_image text,
  accent_color text,                -- hex/oklch
  author_id uuid not null references public.profiles(id),
  category_id uuid references public.categories(id),
  status post_status not null default 'draft',
  published_at timestamptz,
  scheduled_for timestamptz,
  read_time_minutes int default 1,
  view_count int not null default 0,
  search_vector tsvector generated always as (
    setweight(to_tsvector('spanish', coalesce(title,'')), 'A') ||
    setweight(to_tsvector('spanish', coalesce(excerpt,'')), 'B') ||
    setweight(to_tsvector('spanish', coalesce(content_html,'')), 'C')
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index idx_posts_slug on public.posts(slug);
create index idx_posts_status on public.posts(status);
create index idx_posts_published_at on public.posts(published_at desc);
create index idx_posts_search on public.posts using gin(search_vector);
create index idx_posts_author on public.posts(author_id);
create index idx_posts_category on public.posts(category_id);

-- M:N posts ↔ tags
create table public.post_tags (
  post_id uuid not null references public.posts(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key (post_id, tag_id)
);

create index idx_post_tags_tag on public.post_tags(tag_id);

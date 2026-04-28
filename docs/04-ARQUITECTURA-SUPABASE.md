# Arquitectura Supabase

## Schema SQL completo

> Las migraciones se versionan con Supabase CLI en `supabase/migrations/`. Una migración por feature (mejor para revertir).

### Migration 001 — Extensions & enums

```sql
create extension if not exists "uuid-ossp";
create extension if not exists pg_trgm;
create extension if not exists pgcrypto;

-- Enums
create type user_role as enum ('admin', 'user');
create type post_status as enum ('draft', 'scheduled', 'published', 'archived');
create type comment_status as enum ('pending', 'approved', 'rejected', 'spam');
create type case_status as enum ('new', 'in_review', 'in_progress', 'resolved', 'closed');
create type case_priority as enum ('low', 'medium', 'high');
create type moderation_target as enum ('comment', 'thread', 'reply', 'user');
create type moderation_action as enum ('approve','reject','delete','pin','lock','hide','suspend');
```

### Migration 002 — Profiles

```sql
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 2 and 80),
  avatar_url text,
  bio text check (char_length(bio) <= 500),
  role user_role not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_profiles_role on public.profiles(role);

-- Trigger: auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

### Migration 003 — Categories & Tags

```sql
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
```

### Migration 004 — Posts

```sql
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
  author_id uuid not null references profiles(id),
  category_id uuid references categories(id),
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
  post_id uuid not null references posts(id) on delete cascade,
  tag_id uuid not null references tags(id) on delete cascade,
  primary key (post_id, tag_id)
);
```

### Migration 005 — Comments

```sql
create table public.comments (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid not null references posts(id) on delete cascade,
  author_id uuid references profiles(id),
  author_name text,
  author_email text,
  parent_id uuid references comments(id) on delete cascade,
  content text not null check (char_length(content) between 2 and 2000),
  status comment_status not null default 'pending',
  ip_address inet,
  user_agent text,
  moderated_by uuid references profiles(id),
  moderated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  check (
    (author_id is not null) or
    (author_name is not null and author_email is not null)
  )
);

create index idx_comments_post on public.comments(post_id);
create index idx_comments_status on public.comments(status);
create index idx_comments_parent on public.comments(parent_id);
create index idx_comments_created on public.comments(created_at desc);
```

### Migration 006 — Forums

```sql
create table public.forum_categories (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  description text,
  icon text,
  display_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.forum_threads (
  id uuid primary key default uuid_generate_v4(),
  category_id uuid not null references forum_categories(id),
  author_id uuid not null references profiles(id),
  slug text not null,
  title text not null check (char_length(title) between 5 and 200),
  content text not null check (char_length(content) >= 10),
  is_pinned boolean not null default false,
  is_locked boolean not null default false,
  is_hidden boolean not null default false,
  view_count int not null default 0,
  reply_count int not null default 0,
  last_reply_at timestamptz,
  last_reply_by uuid references profiles(id),
  search_vector tsvector generated always as (
    setweight(to_tsvector('spanish', coalesce(title,'')), 'A') ||
    setweight(to_tsvector('spanish', coalesce(content,'')), 'B')
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (category_id, slug)
);

create index idx_threads_category on public.forum_threads(category_id);
create index idx_threads_author on public.forum_threads(author_id);
create index idx_threads_search on public.forum_threads using gin(search_vector);
create index idx_threads_last_reply on public.forum_threads(last_reply_at desc);

create table public.forum_replies (
  id uuid primary key default uuid_generate_v4(),
  thread_id uuid not null references forum_threads(id) on delete cascade,
  author_id uuid not null references profiles(id),
  content text not null check (char_length(content) between 2 and 5000),
  is_helpful boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index idx_replies_thread on public.forum_replies(thread_id);
create index idx_replies_author on public.forum_replies(author_id);
```

### Migration 007 — Cases

```sql
create sequence case_code_seq;

create table public.cases (
  id uuid primary key default uuid_generate_v4(),
  code text unique not null default 'CS-' || extract(year from now()) || '-' || lpad(nextval('case_code_seq')::text, 4, '0'),
  name text not null,
  email text not null,
  phone text,
  subject text not null,
  message text not null,
  status case_status not null default 'new',
  priority case_priority not null default 'medium',
  assigned_to uuid references profiles(id),
  notes text,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_cases_code on public.cases(code);
create index idx_cases_status on public.cases(status);
create index idx_cases_assigned on public.cases(assigned_to);
create index idx_cases_email on public.cases(email);

create table public.case_messages (
  id uuid primary key default uuid_generate_v4(),
  case_id uuid not null references cases(id) on delete cascade,
  author_id uuid references profiles(id),
  message text not null,
  is_internal boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_case_messages_case on public.case_messages(case_id);
```

### Migration 008 — Moderation logs & post views

```sql
create table public.moderation_logs (
  id uuid primary key default uuid_generate_v4(),
  moderator_id uuid not null references profiles(id),
  target_type moderation_target not null,
  target_id uuid not null,
  action moderation_action not null,
  reason text,
  created_at timestamptz not null default now()
);

create index idx_modlog_target on public.moderation_logs(target_type, target_id);

create table public.post_views (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid not null references posts(id) on delete cascade,
  ip_hash text,                    -- hash IP para deduplicar sin guardar IP
  viewed_at timestamptz not null default now()
);

create index idx_views_post_date on public.post_views(post_id, viewed_at);
```

### Migration 009 — Updated_at triggers

```sql
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end; $$;

-- Aplicar a todas las tablas con updated_at
do $$
declare t text;
begin
  for t in
    select unnest(array['profiles','categories','posts','comments','forum_threads','forum_replies','cases'])
  loop
    execute format(
      'create trigger trg_%I_updated before update on public.%I for each row execute function public.set_updated_at()',
      t, t
    );
  end loop;
end $$;
```

### Migration 010 — Reply count trigger

```sql
create or replace function public.update_thread_reply_stats()
returns trigger language plpgsql as $$
begin
  if TG_OP = 'INSERT' then
    update forum_threads
      set reply_count = reply_count + 1,
          last_reply_at = new.created_at,
          last_reply_by = new.author_id
      where id = new.thread_id;
  elsif TG_OP = 'DELETE' then
    update forum_threads
      set reply_count = greatest(reply_count - 1, 0)
      where id = old.thread_id;
  end if;
  return null;
end; $$;

create trigger trg_replies_count
  after insert or delete on forum_replies
  for each row execute function update_thread_reply_stats();
```

### Migration 011 — Schedule publishing function (pg_cron)

```sql
create extension if not exists pg_cron;

create or replace function public.publish_scheduled_posts()
returns void language sql as $$
  update posts
  set status = 'published',
      published_at = now()
  where status = 'scheduled'
    and scheduled_for <= now()
    and deleted_at is null;
$$;

select cron.schedule(
  'publish-scheduled-posts',
  '*/5 * * * *',
  $$select public.publish_scheduled_posts();$$
);
```

## RLS Policies

### Activación

```sql
alter table profiles enable row level security;
alter table categories enable row level security;
alter table tags enable row level security;
alter table posts enable row level security;
alter table post_tags enable row level security;
alter table comments enable row level security;
alter table forum_categories enable row level security;
alter table forum_threads enable row level security;
alter table forum_replies enable row level security;
alter table cases enable row level security;
alter table case_messages enable row level security;
alter table moderation_logs enable row level security;
alter table post_views enable row level security;
```

### Helper

```sql
create or replace function public.is_admin()
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role = 'admin'
  );
$$;
```

### profiles

```sql
-- Lectura pública de campos básicos (display_name, avatar_url, bio)
create policy "profiles_select_public" on profiles
  for select using (true);

create policy "profiles_update_self" on profiles
  for update using (auth.uid() = id);

-- Admin puede actualizar a cualquiera (role, etc.)
create policy "profiles_admin_update_all" on profiles
  for update using (is_admin());
```

### posts

```sql
create policy "posts_select_published" on posts
  for select using (
    (status = 'published' and deleted_at is null)
    or is_admin()
  );

create policy "posts_admin_all" on posts
  for all using (is_admin()) with check (is_admin());
```

### categories / tags / forum_categories

```sql
create policy "select_public" on categories for select using (true);
create policy "admin_modify" on categories for all using (is_admin()) with check (is_admin());
-- igual para tags y forum_categories
```

### comments

```sql
create policy "comments_select_approved" on comments
  for select using (
    (status = 'approved' and deleted_at is null)
    or is_admin()
    or author_id = auth.uid()
  );

create policy "comments_insert_anyone" on comments
  for insert with check (
    -- Authenticated user must match author_id
    (auth.uid() is not null and auth.uid() = author_id)
    -- Or anonymous with email/name
    or (auth.uid() is null and author_id is null and author_name is not null and author_email is not null)
  );

create policy "comments_admin_modify" on comments
  for update using (is_admin()) with check (is_admin());

create policy "comments_admin_delete" on comments
  for delete using (is_admin());
```

### forum_threads / forum_replies

```sql
create policy "threads_select" on forum_threads
  for select using (
    (is_hidden = false and deleted_at is null) or is_admin()
  );

create policy "threads_insert_auth" on forum_threads
  for insert with check (auth.uid() = author_id);

create policy "threads_update_self_admin" on forum_threads
  for update using (
    (auth.uid() = author_id and created_at > now() - interval '15 minutes')
    or is_admin()
  );

create policy "threads_admin_delete" on forum_threads
  for delete using (is_admin());

-- Replies
create policy "replies_select" on forum_replies
  for select using (deleted_at is null or is_admin());

create policy "replies_insert_auth" on forum_replies
  for insert with check (
    auth.uid() = author_id
    -- Y el thread no debe estar locked
    and exists (
      select 1 from forum_threads t
      where t.id = thread_id and t.is_locked = false and t.deleted_at is null
    )
  );

create policy "replies_update_self_admin" on forum_replies
  for update using (
    (auth.uid() = author_id and created_at > now() - interval '15 minutes')
    or is_admin()
  );
```

### cases

```sql
-- Insert público (formulario de contacto)
create policy "cases_insert_anyone" on cases
  for insert with check (true);

-- Select solo admin
create policy "cases_select_admin" on cases
  for select using (is_admin());

create policy "cases_update_admin" on cases
  for update using (is_admin()) with check (is_admin());

-- Para consulta pública por código se usa Edge Function con service role
```

### case_messages

```sql
create policy "case_messages_admin" on case_messages
  for all using (is_admin()) with check (is_admin());
```

### moderation_logs

```sql
create policy "modlog_select_admin" on moderation_logs
  for select using (is_admin());

create policy "modlog_insert_admin" on moderation_logs
  for insert with check (is_admin() and moderator_id = auth.uid());
```

### post_views

```sql
-- Solo se inserta vía RPC con service role
create policy "views_select_admin" on post_views
  for select using (is_admin());
```

## Storage buckets

| Bucket | Visibilidad | Path strategy | Política |
|---|---|---|---|
| `post-images` | público | `posts/{post_id}/{filename}` | INSERT: solo admin; SELECT: público |
| `avatars` | público | `{user_id}/{filename}` | INSERT/UPDATE: self; SELECT: público |
| `case-attachments` | privado | `{case_id}/{filename}` | INSERT: público (sin login); SELECT: admin |

```sql
-- Ejemplo policy storage avatars
create policy "avatars_insert_self"
on storage.objects for insert
with check (
  bucket_id = 'avatars' and
  auth.uid()::text = (storage.foldername(name))[1]
);

create policy "avatars_select_public"
on storage.objects for select
using (bucket_id = 'avatars');
```

## Edge Functions

| Función | Trigger | Descripción |
|---|---|---|
| `send-comment-notification` | DB trigger en `comments` INSERT | Email al admin con nuevo comentario |
| `send-case-notification` | DB trigger en `cases` INSERT | Email al admin + email al cliente con código |
| `send-case-status-update` | DB trigger en `cases` UPDATE de status | Email al cliente |
| `track-post-view` | RPC desde Next.js | Inserta en post_views, dedupe por hash IP |
| `case-public-status` | HTTP público | Dado un código + email, devuelve estado del caso |
| `purge-soft-deleted` | Cron diario | Elimina registros con `deleted_at < now() - 30 days` |

## Datos iniciales (seeds)

```sql
-- Migration 099 — seeds
insert into categories (slug, name, description, display_order) values
  ('impuestos', 'Impuestos', 'Novedades impositivas, reformas y guías prácticas', 1),
  ('contabilidad', 'Contabilidad', 'Normativas contables, balances y reportes financieros', 2),
  ('empresas', 'Empresas', 'Constitución, gestión y consultoría empresarial', 3),
  ('laboral', 'Laboral & RRHH', 'Legislación laboral, liquidaciones y convenios', 4),
  ('finanzas', 'Finanzas Personales', 'Planificación financiera, inversiones y patrimonio', 5);

insert into tags (slug, name) values
  ('iva','IVA'),('ganancias','Ganancias'),('monotributo','Monotributo'),
  ('pymes','PyMEs'),('balances','Balances'),('afip','AFIP'),
  ('liquidaciones','Liquidaciones'),('inversiones','Inversiones'),
  ('sociedades','Sociedades'),('facturacion','Facturación');

insert into forum_categories (slug, name, description, icon, display_order) values
  ('impuestos','Impuestos','Consultas sobre IVA, Ganancias, Bienes Personales, monotributo y regímenes especiales.','receipt',1),
  ('recursos-humanos','Recursos Humanos','Liquidación de sueldos, convenios colectivos, ART y consultas laborales.','users',2),
  ('empresas','Empresas & Sociedades','Constitución de sociedades, actas, estatutos y gestión societaria.','building',3),
  ('contabilidad','Contabilidad','Registración contable, normas, balances y auditoría.','calculator',4),
  ('consultas-generales','Consultas Generales','Preguntas generales sobre trámites, plazos y procedimientos.','help-circle',5);
```

## Estrategia de migraciones

- **Tooling:** Supabase CLI (`supabase migration new`).
- **Flujo:** PR con migración + types regenerados → review → merge → CI corre `supabase db push` en preview → tests E2E → deploy a prod.
- **Rollback:** cada migración tiene un `_down.sql` opcional para entornos de desarrollo. Producción: forward-only (con feature flags si hace falta).
- **Types:** después de cada migración `supabase gen types typescript --local > src/types/database.ts`.

## Variables de entorno

```bash
# .env.local (no commitear)
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role>           # solo server / Edge Functions
RESEND_API_KEY=<resend-api-key>
RESEND_FROM=hola@velazquezyasociados.com
NEXT_PUBLIC_WHATSAPP_NUMBER=5491145678900          # con código país
NEXT_PUBLIC_SITE_URL=https://velazquezyasociados.com
```

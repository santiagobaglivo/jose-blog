-- RLS update para multi-marca:
-- Lectura pública filtrada por marca activa (post/categoría/tag de marca
-- desactivada no se ve aunque esté published).
--
-- El filtrado por dominio (un visitante de escudotributario.pe solo ve cosas
-- de Escudo Tributario) NO se hace en RLS porque las policies no leen headers.
-- Eso es responsabilidad del server-side: el proxy detecta el host y las
-- queries filtran por brand_id explícitamente. RLS es la última red de seguridad.

-- posts: incluir check de brand activa
drop policy if exists "posts_select_published" on public.posts;
create policy "posts_select_published" on public.posts
  for select using (
    (
      status = 'published'
      and deleted_at is null
      and exists (
        select 1 from public.brands b
        where b.id = posts.brand_id
          and b.is_active = true
          and b.deleted_at is null
      )
    )
    or public.is_admin()
  );

-- categories: lectura pública si marca activa
drop policy if exists "categories_select_public" on public.categories;
create policy "categories_select_public" on public.categories
  for select using (
    exists (
      select 1 from public.brands b
      where b.id = categories.brand_id
        and b.is_active = true
        and b.deleted_at is null
    )
    or public.is_admin()
  );

-- tags: lectura pública si marca activa
drop policy if exists "tags_select_public" on public.tags;
create policy "tags_select_public" on public.tags
  for select using (
    exists (
      select 1 from public.brands b
      where b.id = tags.brand_id
        and b.is_active = true
        and b.deleted_at is null
    )
    or public.is_admin()
  );

-- profiles: queda igual (select público para mostrar autor en posts/comentarios)
-- El brand_id se ve, pero no compromete privacidad (es un atributo público).

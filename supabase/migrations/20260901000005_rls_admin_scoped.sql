-- Refactor de RLS: las tablas brand-scoped pasan a usar is_admin_of(brand_id).
-- Super-admin sigue viendo/editando todo (gracias a is_admin_of devolver true para super).
-- Admin local solo puede tocar datos de SU brand.

-- ===========================================================================
-- brands
-- ===========================================================================
DROP POLICY IF EXISTS "brands_admin_all" ON public.brands;

-- Super crea cualquier brand.
CREATE POLICY "brands_super_insert" ON public.brands
  FOR INSERT WITH CHECK (public.is_superadmin());

-- Super o admin local de la propia brand puede editar.
CREATE POLICY "brands_admin_update" ON public.brands
  FOR UPDATE USING (public.is_admin_of(id)) WITH CHECK (public.is_admin_of(id));

-- Solo super borra (soft delete via UPDATE deleted_at también pasa por la policy de update).
CREATE POLICY "brands_super_delete" ON public.brands
  FOR DELETE USING (public.is_superadmin());

-- ===========================================================================
-- brand_services
-- ===========================================================================
DROP POLICY IF EXISTS "brand_services_admin_all" ON public.brand_services;

CREATE POLICY "brand_services_admin_all" ON public.brand_services
  FOR ALL
  USING (public.is_admin_of(brand_id))
  WITH CHECK (public.is_admin_of(brand_id));

-- ===========================================================================
-- categories
-- ===========================================================================
DROP POLICY IF EXISTS "categories_admin_all" ON public.categories;

CREATE POLICY "categories_admin_all" ON public.categories
  FOR ALL
  USING (public.is_admin_of(brand_id))
  WITH CHECK (public.is_admin_of(brand_id));

-- ===========================================================================
-- tags
-- ===========================================================================
DROP POLICY IF EXISTS "tags_admin_all" ON public.tags;

CREATE POLICY "tags_admin_all" ON public.tags
  FOR ALL
  USING (public.is_admin_of(brand_id))
  WITH CHECK (public.is_admin_of(brand_id));

-- ===========================================================================
-- posts
-- ===========================================================================
DROP POLICY IF EXISTS "posts_admin_all" ON public.posts;
DROP POLICY IF EXISTS "posts_select_published" ON public.posts;

-- Recreamos select para que admin (cualquier rol) vea no-publicados sólo de SU brand.
CREATE POLICY "posts_select_published" ON public.posts
  FOR SELECT USING (
    (status = 'published' AND deleted_at IS NULL)
    OR public.is_admin_of(brand_id)
  );

CREATE POLICY "posts_admin_all" ON public.posts
  FOR ALL
  USING (public.is_admin_of(brand_id))
  WITH CHECK (public.is_admin_of(brand_id));

-- ===========================================================================
-- post_tags (sin brand_id propio — se valida via posts.brand_id)
-- ===========================================================================
DROP POLICY IF EXISTS "post_tags_admin_all" ON public.post_tags;
DROP POLICY IF EXISTS "post_tags_select_with_post" ON public.post_tags;

CREATE POLICY "post_tags_select_with_post" ON public.post_tags
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.posts p
      WHERE p.id = post_tags.post_id
        AND (
          (p.status = 'published' AND p.deleted_at IS NULL)
          OR public.is_admin_of(p.brand_id)
        )
    )
  );

CREATE POLICY "post_tags_admin_all" ON public.post_tags
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.posts p
      WHERE p.id = post_tags.post_id AND public.is_admin_of(p.brand_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.posts p
      WHERE p.id = post_tags.post_id AND public.is_admin_of(p.brand_id)
    )
  );

-- ===========================================================================
-- comments
-- ===========================================================================
DROP POLICY IF EXISTS "comments_admin_all" ON public.comments;

CREATE POLICY "comments_admin_all" ON public.comments
  FOR ALL
  USING (public.is_admin_of(brand_id))
  WITH CHECK (public.is_admin_of(brand_id));

-- ===========================================================================
-- forum_categories
-- ===========================================================================
DROP POLICY IF EXISTS "forum_cats_admin_all" ON public.forum_categories;

CREATE POLICY "forum_cats_admin_all" ON public.forum_categories
  FOR ALL
  USING (public.is_admin_of(brand_id))
  WITH CHECK (public.is_admin_of(brand_id));

-- ===========================================================================
-- forum_threads
-- ===========================================================================
DROP POLICY IF EXISTS "forum_threads_admin_all" ON public.forum_threads;

CREATE POLICY "forum_threads_admin_all" ON public.forum_threads
  FOR ALL
  USING (public.is_admin_of(brand_id))
  WITH CHECK (public.is_admin_of(brand_id));

-- ===========================================================================
-- forum_replies (sin brand_id propio — vía forum_threads)
-- ===========================================================================
DROP POLICY IF EXISTS "forum_replies_admin_all" ON public.forum_replies;
DROP POLICY IF EXISTS "forum_replies_select_public" ON public.forum_replies;

CREATE POLICY "forum_replies_select_public" ON public.forum_replies
  FOR SELECT USING (
    (deleted_at IS NULL
     AND EXISTS (
       SELECT 1 FROM public.forum_threads t
       WHERE t.id = forum_replies.thread_id AND t.deleted_at IS NULL
     ))
    OR EXISTS (
      SELECT 1 FROM public.forum_threads t
      WHERE t.id = forum_replies.thread_id AND public.is_admin_of(t.brand_id)
    )
  );

CREATE POLICY "forum_replies_admin_all" ON public.forum_replies
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.forum_threads t
      WHERE t.id = forum_replies.thread_id AND public.is_admin_of(t.brand_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.forum_threads t
      WHERE t.id = forum_replies.thread_id AND public.is_admin_of(t.brand_id)
    )
  );

-- ===========================================================================
-- contact_messages
-- ===========================================================================
DROP POLICY IF EXISTS "contact_admin_all" ON public.contact_messages;

CREATE POLICY "contact_admin_all" ON public.contact_messages
  FOR ALL
  USING (public.is_admin_of(brand_id))
  WITH CHECK (public.is_admin_of(brand_id));

-- ===========================================================================
-- profiles
-- ===========================================================================
-- profiles tiene brand_id; admin local solo gestiona profiles de SU brand.
-- Super gestiona todos.
DROP POLICY IF EXISTS "profiles_admin_update_all" ON public.profiles;

CREATE POLICY "profiles_super_update_all" ON public.profiles
  FOR UPDATE USING (public.is_superadmin());

-- Admin local actualiza profiles de su brand.
CREATE POLICY "profiles_local_admin_update" ON public.profiles
  FOR UPDATE
  USING (
    brand_id IS NOT NULL AND public.is_admin_of(brand_id)
  );

-- profiles_update_self queda intacta (auth.uid() = id) — cada user edita el suyo.
-- profiles_select_public queda intacta — todos pueden ver perfiles.

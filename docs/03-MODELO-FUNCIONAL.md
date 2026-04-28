# Modelo Funcional del Sistema

## Módulos principales

| Módulo                | Descripción                                  | Tipo                 |
| --------------------- | -------------------------------------------- | -------------------- |
| **Auth**              | Registro, login, recuperación, perfil        | Transversal          |
| **Blog público**      | Listado, detalle, búsqueda, categorías, tags | Frontend público     |
| **Blog admin**        | CRUD artículos, programación, editor         | Admin                |
| **Comentarios**       | Crear, moderar, responder                    | Mixto                |
| **Foros públicos**    | Categorías, hilos, respuestas                | Frontend autenticado |
| **Foros admin**       | Moderación (pin/lock/delete)                 | Admin                |
| **Casos**             | Contacto → caso con estado y seguimiento     | Mixto                |
| **Categorías & Tags** | Taxonomía blog y foros                       | Admin                |
| **Usuarios**          | Listado, gestión de roles                    | Admin                |
| **Storage**           | Upload de imágenes destacadas, avatares      | Transversal          |
| **Servicios**         | Páginas estáticas por servicio (landing)     | Frontend público     |

## Roles

| Rol                       | Descripción                        | Acceso                                                                                   |
| ------------------------- | ---------------------------------- | ---------------------------------------------------------------------------------------- |
| **Visitante** (anonymous) | No autenticado                     | Lectura blog, lectura foros (read), lectura servicios, formulario contacto               |
| **Usuario registrado**    | Autenticado, sin privilegios admin | Todo lo de visitante + comentar en blog, crear hilos en foros, responder, editar perfil  |
| **Admin**                 | Staff del estudio                  | Todo lo de usuario + panel admin completo (CRUD artículos, moderación, gestión usuarios) |

## Flujos por rol

### Visitante

```
1. Llega a / → ve hero, servicios, últimos posts
2. Navega a /blog → busca/filtra → entra a /blog/[slug]
3. Ve artículo y comentarios aprobados
4. Si quiere comentar → lo invita a registrarse o ingresa nombre+email (decisión pendiente)
5. Navega a /foros → ve categorías
6. Si quiere participar en foro → debe registrarse
7. Navega a /contacto → llena formulario → recibe código de seguimiento
8. Puede consultar estado del caso ingresando código (modo público)
```

### Usuario registrado

```
1. Login en /auth/login
2. Acceso a perfil /perfil → edita nombre, avatar, descripción
3. Comenta en blog (pasa por moderación)
4. Crea hilo o responde en foros
5. Ve sus comentarios e hilos en su perfil
6. Logout
```

### Admin

```
1. Login con cuenta de admin
2. Va a /admin → ve dashboard con métricas reales
3. /admin/articulos → crea borrador → editor → upload imagen → asigna categoría/tags → guarda como borrador / programa / publica
4. /admin/programados → ve borradores y programados
5. /admin/comentarios → cola de pendientes → aprueba / rechaza / responde
6. /admin/categorias → CRUD de categorías y tags
7. /admin/foros → modera categorías, hilos, respuestas (pin / lock / hide / delete)
8. /admin/usuarios → ve lista, cambia rol, suspende
9. /admin/casos → ve casos, asigna, cambia estado, responde al cliente
```

## Entidades principales

### profiles

Perfil del usuario (1:1 con `auth.users`).

| Campo        | Tipo                 | Notas             |
| ------------ | -------------------- | ----------------- |
| id           | uuid PK              | = `auth.users.id` |
| display_name | text                 |                   |
| avatar_url   | text                 | nullable          |
| bio          | text                 | nullable          |
| role         | enum('admin','user') | default 'user'    |
| created_at   | timestamptz          |                   |
| updated_at   | timestamptz          |                   |

### posts

Artículos del blog.

| Campo                              | Tipo                                             | Notas                             |
| ---------------------------------- | ------------------------------------------------ | --------------------------------- |
| id                                 | uuid PK                                          |                                   |
| slug                               | text UNIQUE                                      |                                   |
| title                              | text                                             |                                   |
| subtitle                           | text                                             | nullable                          |
| excerpt                            | text                                             |                                   |
| content                            | jsonb                                            | TipTap JSON                       |
| content_html                       | text                                             | render server-side cacheado       |
| featured_image                     | text                                             | URL Storage                       |
| accent_color                       | text                                             | hex/oklch — para variación visual |
| author_id                          | uuid FK → profiles                               |                                   |
| category_id                        | uuid FK → categories                             |                                   |
| status                             | enum('draft','scheduled','published','archived') |                                   |
| published_at                       | timestamptz                                      | nullable                          |
| scheduled_for                      | timestamptz                                      | nullable                          |
| read_time_minutes                  | int                                              | calculado                         |
| view_count                         | int                                              | default 0                         |
| search_vector                      | tsvector                                         | GENERATED                         |
| created_at, updated_at, deleted_at | timestamptz                                      | soft delete                       |

### categories

Categorías de blog.

| Campo                  | Tipo        |
| ---------------------- | ----------- |
| id                     | uuid PK     |
| slug                   | text UNIQUE |
| name                   | text        |
| description            | text        |
| created_at, updated_at | timestamptz |

### tags

| Campo | Tipo        |
| ----- | ----------- |
| id    | uuid PK     |
| slug  | text UNIQUE |
| name  | text        |

### post_tags (M:N)

| Campo   | Tipo    |
| ------- | ------- |
| post_id | uuid FK |
| tag_id  | uuid FK |

### comments

| Campo                                | Tipo                                         | Notas                          |
| ------------------------------------ | -------------------------------------------- | ------------------------------ |
| id                                   | uuid PK                                      |                                |
| post_id                              | uuid FK                                      |                                |
| author_id                            | uuid FK → profiles                           | nullable si comentario anónimo |
| author_name                          | text                                         | si anónimo                     |
| author_email                         | text                                         | si anónimo                     |
| parent_id                            | uuid FK → comments                           | nullable, para reply (1 nivel) |
| content                              | text                                         |                                |
| status                               | enum('pending','approved','rejected','spam') | default 'pending'              |
| ip_address                           | inet                                         | para anti-spam                 |
| created_at, updated_at, moderated_at | timestamptz                                  |                                |
| moderated_by                         | uuid FK → profiles                           | nullable                       |

### forum_categories

| Campo         | Tipo        |
| ------------- | ----------- |
| id            | uuid PK     |
| slug          | text UNIQUE |
| name          | text        |
| description   | text        |
| icon          | text        |
| display_order | int         |
| is_active     | boolean     |

### forum_threads

| Campo                              | Tipo               | Notas                         |
| ---------------------------------- | ------------------ | ----------------------------- |
| id                                 | uuid PK            |                               |
| category_id                        | uuid FK            |                               |
| author_id                          | uuid FK → profiles |                               |
| slug                               | text               | unique compuesto con category |
| title                              | text               |                               |
| content                            | text               |                               |
| is_pinned                          | boolean            |                               |
| is_locked                          | boolean            |                               |
| is_hidden                          | boolean            |                               |
| view_count                         | int                |                               |
| reply_count                        | int                |                               |
| last_reply_at                      | timestamptz        |                               |
| last_reply_by                      | uuid FK            |                               |
| search_vector                      | tsvector           | GENERATED                     |
| created_at, updated_at, deleted_at | timestamptz        |                               |

### forum_replies

| Campo                              | Tipo        |
| ---------------------------------- | ----------- |
| id                                 | uuid PK     |
| thread_id                          | uuid FK     |
| author_id                          | uuid FK     |
| content                            | text        |
| is_helpful                         | boolean     |
| created_at, updated_at, deleted_at | timestamptz |

### cases (seguimiento de casos)

| Campo                               | Tipo                                                      | Notas                                                                   |
| ----------------------------------- | --------------------------------------------------------- | ----------------------------------------------------------------------- |
| id                                  | uuid PK                                                   |                                                                         |
| code                                | text UNIQUE                                               | público, ej. "CS-2026-001" — el cliente puede consultar con este código |
| name                                | text                                                      |                                                                         |
| email                               | text                                                      |                                                                         |
| phone                               | text                                                      | nullable                                                                |
| subject                             | text                                                      |                                                                         |
| message                             | text                                                      |                                                                         |
| status                              | enum('new','in_review','in_progress','resolved','closed') |                                                                         |
| priority                            | enum('low','medium','high')                               | default 'medium'                                                        |
| assigned_to                         | uuid FK → profiles                                        | nullable                                                                |
| notes                               | text                                                      | notas internas                                                          |
| created_at, updated_at, resolved_at | timestamptz                                               |                                                                         |

### case_messages

Conversación interna del caso.

| Campo       | Tipo               |
| ----------- | ------------------ | ----------------------------------------------- |
| id          | uuid PK            |
| case_id     | uuid FK            |
| author_id   | uuid FK → profiles |
| message     | text               |
| is_internal | boolean            | true = nota interna, false = visible al cliente |
| created_at  | timestamptz        |

### moderation_logs

Auditoría de acciones de moderación.

| Campo        | Tipo                                                            |
| ------------ | --------------------------------------------------------------- |
| id           | uuid PK                                                         |
| moderator_id | uuid FK                                                         |
| target_type  | enum('comment','thread','reply','user')                         |
| target_id    | uuid                                                            |
| action       | enum('approve','reject','delete','pin','lock','hide','suspend') |
| reason       | text                                                            |
| created_at   | timestamptz                                                     |

## Acciones CRUD por entidad

| Entidad       | Crear                      | Leer                       | Actualizar                | Eliminar     |
| ------------- | -------------------------- | -------------------------- | ------------------------- | ------------ |
| profiles      | auto (trigger on signup)   | self / public name         | self                      | admin        |
| posts         | admin                      | público (status=published) | admin (autor + admin)     | admin (soft) |
| categories    | admin                      | público                    | admin                     | admin        |
| tags          | admin                      | público                    | admin                     | admin        |
| comments      | user/anon                  | público (approved)         | self (sin cambiar status) | admin (soft) |
| forum_threads | user                       | público                    | self / admin              | admin (soft) |
| forum_replies | user                       | público                    | self / admin              | admin (soft) |
| cases         | público (anon)             | self por código / admin    | admin                     | admin        |
| case_messages | admin / cliente con código | self / admin               | —                         | —            |

## Estados de cada entidad

```
posts.status:           draft → scheduled → published → archived
comments.status:        pending → approved | rejected | spam
forum_threads:          (active) ↔ pinned ↔ locked ↔ hidden ↔ deleted
cases.status:           new → in_review → in_progress → resolved → closed
```

## Permisos por rol (RLS resumen)

### profiles

- SELECT: público (display_name, avatar_url, bio); self (full)
- UPDATE: self only
- INSERT: trigger automático on auth.users INSERT
- DELETE: admin only

### posts

- SELECT: público si `status='published' AND deleted_at IS NULL`; admin todo
- INSERT: admin only
- UPDATE: admin only
- DELETE: admin only (soft delete)

### comments

- SELECT: público si `status='approved' AND deleted_at IS NULL`; admin todo; self todos los propios
- INSERT: cualquier autenticado o anónimo (se filtra por captcha + rate limit)
- UPDATE: admin only (cambio de status); autor en ventana de edición de 5 min
- DELETE: admin (soft)

### forum_threads / forum_replies

- SELECT: público si no hidden/deleted; admin todo
- INSERT: usuarios autenticados
- UPDATE: autor (en ventana de tiempo) o admin
- DELETE: admin only (soft)

### cases

- SELECT: por código público (sin login) o admin
- INSERT: público
- UPDATE: admin only
- DELETE: admin only

## Eventos importantes (triggers / Edge Functions)

| Evento                              | Acción                                                                                   |
| ----------------------------------- | ---------------------------------------------------------------------------------------- |
| `auth.users` INSERT                 | Crear profile con role='user'                                                            |
| `posts` UPDATE → status=published   | Reset view_count si nuevo, calcular read_time                                            |
| `comments` INSERT                   | Notificar admin por email (Edge Function)                                                |
| `comments` UPDATE → status=approved | Notificar autor del post + autor del comment                                             |
| `forum_threads` INSERT              | Notificar admin                                                                          |
| `cases` INSERT                      | Generar código único, enviar email al cliente con código y al admin                      |
| `cases` UPDATE → status change      | Notificar al cliente por email                                                           |
| Cron diario                         | Procesar `posts` con `scheduled_for <= now()` y status='scheduled' → cambiar a published |

## Notificaciones necesarias

### Email (vía Resend)

1. Verificación de cuenta (Supabase Auth nativo)
2. Recuperación de contraseña (Supabase Auth nativo)
3. Comentario aprobado al autor
4. Nuevo comentario al admin (resumen diario opcional)
5. Nuevo caso al admin
6. Cambio de estado de caso al cliente
7. Nueva respuesta en hilo donde participás (opt-in)

### In-app (futuro / out of scope MVP)

- Centro de notificaciones
- Push web

## Archivos / documentos necesarios

### Storage buckets

- `post-images` (público) — imágenes destacadas y de contenido
- `avatars` (público) — avatares de usuarios
- `case-attachments` (privado) — futuro: adjuntos en casos

### Límites

- Imagen destacada: max 5 MB, formatos jpg/png/webp
- Avatar: max 1 MB
- Resize automático: vía transformaciones de Supabase Storage o sharp en Edge Function

## Métricas / Dashboard

| Métrica                | Cálculo                                                | Refresh |
| ---------------------- | ------------------------------------------------------ | ------- |
| Artículos publicados   | count(posts) where status='published'                  | live    |
| Borradores             | count where status='draft'                             | live    |
| Programados            | count where status='scheduled'                         | live    |
| Comentarios pendientes | count(comments) where status='pending'                 | live    |
| Hilos en foros         | count(forum_threads) where deleted_at IS NULL          | live    |
| Usuarios registrados   | count(profiles)                                        | live    |
| Visitas del mes        | sum(post_views.event_count) where month = current      | hourly  |
| Casos abiertos         | count(cases) where status NOT IN ('resolved','closed') | live    |
| Top 5 artículos        | order by view_count desc limit 5                       | live    |
| Tendencia visitas      | line chart últimos 30 días                             | hourly  |

## Búsqueda

### Blog

- `search_vector` GENERATED ALWAYS sobre `title`, `excerpt`, `content_html` con `to_tsvector('spanish', ...)`
- Index GIN sobre `search_vector`
- Query: `WHERE search_vector @@ plainto_tsquery('spanish', $1)`

### Foros

- `search_vector` sobre `title` + `content` de threads
- Búsqueda dentro de hilos: full-text sobre replies opcionales

## Integraciones

| Servicio                      | Uso                                         | Sprint    |
| ----------------------------- | ------------------------------------------- | --------- |
| Supabase                      | Backend (DB, Auth, Storage, Edge Functions) | Sprint 1+ |
| Resend                        | Emails transaccionales                      | Sprint 3  |
| WhatsApp Business             | Link wa.me con número configurado           | Sprint 5  |
| Vercel                        | Hosting                                     | Sprint 6  |
| (Futuro) Cloudflare Turnstile | Anti-bot avanzado                           | Post-MVP  |
| (Futuro) Stripe / MercadoPago | Pagos                                       | Fase 2    |

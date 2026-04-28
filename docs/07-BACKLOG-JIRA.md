# Backlog Jira — Tareas con prompts para Claude Code

> **Convenciones:**
>
> - Las épicas usan keys EPIC-XX
> - Las tareas usan keys JB-XXX (los IDs reales los asigna Jira al crearse)
> - **Prioridad:** Highest, High, Medium, Low
> - **Estimación:** 1 punto = 2-3h efectivas
> - Cada tarea trae el prompt exacto para Claude Code

---

## ÉPICAS

### EPIC-1: Infraestructura & Setup

Preparar el repo y Supabase para conectar todo. Dejar el prototipo en estado coherente para enchufar backend.

### EPIC-2: Autenticación & Usuarios

Sistema completo de auth, perfiles, roles y guards.

### EPIC-3: Blog backend

CRUD completo del blog: artículos, editor, categorías, tags, programación, búsqueda.

### EPIC-4: Comentarios y moderación

Sistema de comentarios con cola de moderación, anti-spam y respuestas.

### EPIC-5: Foros

Categorías, hilos, respuestas, moderación.

### EPIC-6: Casos / Contacto

Formulario de contacto que crea casos con seguimiento por código.

### EPIC-7: Storage & Media

Buckets de imágenes, upload, transformaciones.

### EPIC-8: Dashboard & Métricas

Dashboard real con datos de la plataforma.

### EPIC-9: Visual & UX premium (Hero carousel, WhatsApp, servicios)

Cumplir requerimientos visuales del cliente: hero animado, WhatsApp, páginas de servicio.

### EPIC-10: Deuda técnica & Refactor

Refactorizaciones internas para escalabilidad.

### EPIC-11: QA, Hardening & Production

Tests, security audit, deploy, observabilidad.

---

## TAREAS DETALLADAS

> Formato condensado: cada tarea trae lo esencial + prompt accionable.

---

### JB-001 — Crear proyecto Supabase y configurar variables de entorno

**Épica:** EPIC-1 · **Tipo:** Task · **Prioridad:** Highest · **Estimación:** 1 · **Sprint:** 0

**Descripción:** Crear el proyecto en Supabase (organización del cliente), configurar región, generar API keys y dejar plantilla `.env.example` y `.env.local` documentadas.

**Objetivo:** Tener un proyecto Supabase listo para recibir migraciones y conexiones desde Next.js.

**Alcance:**

- Crear proyecto en https://supabase.com
- Anotar `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- Crear `.env.example` y `.env.local`
- Agregar `.env.local` al `.gitignore` (ya está pero verificar)

**Archivos involucrados:** `.env.example` (nuevo), `.env.local` (nuevo, no commit), `.gitignore`

**Dependencias:** ninguna (manual del dev/cliente)

**Criterios de aceptación:**

- [ ] Proyecto Supabase creado en región adecuada (sa-east-1 si cliente está en LatAm)
- [ ] `.env.example` documenta todas las variables esperadas
- [ ] `.env.local` (sin commit) tiene los valores reales
- [ ] `npm run dev` arranca sin error de variables faltantes

**Prompt Claude Code:**

```
Generá `.env.example` en la raíz del proyecto con todas las variables que el sistema va a necesitar:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY (con comentario de que es server-only)
- RESEND_API_KEY
- RESEND_FROM
- NEXT_PUBLIC_WHATSAPP_NUMBER
- NEXT_PUBLIC_SITE_URL

Cada variable con un comentario breve. Verificá que `.gitignore` excluya `.env.local`. NO crees el `.env.local`.
```

---

### JB-002 — Setup Supabase CLI y estructura de migraciones

**Épica:** EPIC-1 · **Tipo:** Task · **Prioridad:** Highest · **Estimación:** 1 · **Sprint:** 0

**Descripción:** Instalar Supabase CLI, vincular proyecto local a remoto, crear estructura `supabase/migrations/` y un script npm para correr migraciones.

**Alcance:**

- `supabase init`
- `supabase link --project-ref <ref>`
- Agregar scripts `db:push`, `db:reset`, `db:types` al `package.json`

**Archivos:** `supabase/config.toml`, `package.json`

**Criterios de aceptación:**

- [ ] `supabase` CLI funciona localmente
- [ ] `npm run db:types` regenera `src/types/database.ts`
- [ ] Carpeta `supabase/migrations/` creada y commiteada (con `.gitkeep`)

**Prompt Claude Code:**

```
Inicializá Supabase CLI en el proyecto. Asumí que el dev ya corrió `supabase login` y tiene el project ref guardado.

Pasos:
1. Correr `supabase init` (si no existe `supabase/`)
2. Crear `supabase/migrations/.gitkeep`
3. Agregar al `package.json` los siguientes scripts:
   - "db:push": "supabase db push"
   - "db:reset": "supabase db reset"
   - "db:types": "supabase gen types typescript --linked > src/types/database.ts"
4. Crear `src/types/` con un placeholder `database.ts` que exporte un tipo vacío para evitar errors hasta primera generación

Verificá que `supabase init` no rompa nada. No corras `db:push` todavía.
```

---

### JB-003 — Refactorizar mock-data a queries abstractas

**Épica:** EPIC-1 / EPIC-10 · **Tipo:** Task · **Prioridad:** High · **Estimación:** 2 · **Sprint:** 0

**Descripción:** Crear una capa `src/lib/queries/` con funciones async que hoy retornan los datos mock. Las pages las consumen. Cuando llegue Supabase, solo cambia la implementación interna sin tocar las pages.

**Alcance:**

- `lib/queries/posts.ts`: `getPublishedPosts()`, `getPostBySlug()`, `getPostsByCategory()`, etc.
- `lib/queries/comments.ts`
- `lib/queries/forums.ts`
- `lib/queries/users.ts`
- Reemplazar imports directos de `mock-data.ts` en pages por estas funciones

**Archivos:** `src/lib/queries/*.ts` (nuevos), todas las `page.tsx` actuales.

**Criterios de aceptación:**

- [ ] Pages no importan más de `@/lib/mock-data`
- [ ] Build y dev funcionan idénticamente
- [ ] Cero regresiones visuales

**Prompt Claude Code:**

```
Refactorizá las pages para que no consuman `@/lib/mock-data` directamente. Creá `src/lib/queries/` con módulos que devuelven los mismos datos pero vía funciones async (Promise) para que después solo cambiemos su body por queries Supabase sin tocar las pages.

Crear:
- `src/lib/queries/posts.ts`: getPublishedPosts(), getPostBySlug(slug), getRelatedPosts(slug), getDraftPosts(), getScheduledPosts(), getAllPostsAdmin()
- `src/lib/queries/comments.ts`: getApprovedCommentsByPost(slug), getAllCommentsAdmin()
- `src/lib/queries/forums.ts`: getForumCategories(), getThreadsByCategory(slug), getThreadBySlug(category, slug), getRepliesByThread(threadId)
- `src/lib/queries/categories.ts`: getCategories(), getTags()
- `src/lib/queries/users.ts`: getAllUsersAdmin()

Cada función debe retornar Promise. Internamente lee de mock-data por ahora. Reemplazá los imports en TODAS las pages (públicas y admin) por los nuevos módulos.

Conservá el diseño y la UI exactos. Después corré `npm run build` para verificar y `npm run dev` para sanity check visual.
```

---

### JB-004 — Centralizar statusMap e iconMap en `lib/`

**Épica:** EPIC-10 · **Tipo:** Task · **Prioridad:** Medium · **Estimación:** 1 · **Sprint:** 0

**Descripción:** Hoy hay 3+ definiciones de `statusMap` para posts/comments duplicadas en pages admin. Centralizarlas en `src/lib/status.ts`. Mismo con `iconMap` de foros.

**Archivos:** `src/lib/status.ts` (nuevo), `src/app/admin/articulos/page.tsx`, `src/app/admin/programados/page.tsx`, `src/app/admin/comentarios/page.tsx`, `src/app/(public)/foros/page.tsx`

**Criterios de aceptación:**

- [ ] `lib/status.ts` exporta `postStatusMap`, `commentStatusMap`, `caseStatusMap` (placeholder), `forumIconMap`
- [ ] Pages admin importan desde `lib/status.ts`
- [ ] Cero regresiones visuales

**Prompt Claude Code:**

```
Centralizar status maps e icon maps duplicados. Crear `src/lib/status.ts` con:

export const postStatusMap = {
  publicado: { label: "Publicado", className: "bg-green-50 text-green-700 border-green-200" },
  borrador: { label: "Borrador", className: "bg-gray-50 text-gray-600 border-gray-200" },
  programado: { label: "Programado", className: "bg-blue-50 text-blue-700 border-blue-200" },
}

export const commentStatusMap = {
  aprobado: { label: "Aprobado", className: "bg-green-50 text-green-700 border-green-200" },
  pendiente: { label: "Pendiente", className: "bg-orange-50 text-orange-600 border-orange-200" },
  rechazado: { label: "Rechazado", className: "bg-red-50 text-red-600 border-red-200" },
}

Y exportar `forumIconMap` desde `lib/status.ts` o `lib/icons.ts`. Reemplazar las definiciones locales en las pages admin y en `app/(public)/foros/page.tsx`. Verificar que todo se vea idéntico.
```

---

### JB-005 — Mover mock data inline de `/admin/usuarios` a `mock-data.ts`

**Épica:** EPIC-10 · **Tipo:** Task · **Prioridad:** Low · **Estimación:** 0.5 · **Sprint:** 0

**Prompt Claude Code:**

```
En `src/app/admin/usuarios/page.tsx` hay un `const mockUsers = [...]` declarado dentro del archivo. Movelo a `src/lib/mock-data.ts` como `mockUsers` exportado, junto con `roleConfig`. Importarlo desde la page. Cero cambios visuales.
```

---

### JB-006 — Reemplazar componente X SVG inline por lucide

**Épica:** EPIC-10 · **Tipo:** Task · **Prioridad:** Low · **Estimación:** 0.25 · **Sprint:** 0

**Prompt Claude Code:**

```
En `src/app/admin/categorias/page.tsx` hay un componente `X` definido al final del archivo como SVG inline. Reemplazarlo por `import { X } from "lucide-react"` y eliminar la función local. Verificar que las "X" de los tags se vean igual.
```

---

### JB-007 — Instalar dependencias para backend y forms

**Épica:** EPIC-1 · **Tipo:** Task · **Prioridad:** Highest · **Estimación:** 0.5 · **Sprint:** 0

**Prompt Claude Code:**

```
Instalá las siguientes dependencias en el proyecto:

npm i @supabase/supabase-js @supabase/ssr
npm i react-hook-form @hookform/resolvers zod
npm i sonner
npm i @tiptap/react @tiptap/starter-kit @tiptap/extension-link @tiptap/extension-image @tiptap/extension-placeholder
npm i isomorphic-dompurify
npm i resend

Verificá que `npm run build` siga pasando. No agregues nada más.
```

---

### JB-008 — Setup Toaster global con sonner

**Épica:** EPIC-1 · **Tipo:** Task · **Prioridad:** High · **Estimación:** 0.5 · **Sprint:** 0

**Prompt Claude Code:**

```
Integrá `<Toaster />` de sonner globalmente. Pasos:
1. En `src/app/layout.tsx` (root layout) importá `import { Toaster } from "sonner"` y agregalo dentro del body, después de {children}.
2. Configuralo con tema claro y position "top-right", richColors y closeButton.
3. Verificá que el build pase.

No uses ningún toast todavía — solo dejá el Toaster listo.
```

---

### JB-009 — Setup ESLint estricto + Prettier

**Épica:** EPIC-10 · **Tipo:** Task · **Prioridad:** Low · **Estimación:** 1 · **Sprint:** 0

**Prompt Claude Code:**

```
Endurecé la config de ESLint y agregá Prettier:

1. `npm i -D prettier eslint-config-prettier`
2. Crear `.prettierrc.json` con:
   { "semi": true, "singleQuote": false, "trailingComma": "es5", "printWidth": 100, "tabWidth": 2 }
3. Crear `.prettierignore` con node_modules, .next, public.
4. Actualizar `eslint.config.mjs` para extender de "prettier" como última regla.
5. Agregar scripts al `package.json`:
   "format": "prettier --write .",
   "format:check": "prettier --check ."
6. Correr `npm run format` una vez para normalizar archivos.
7. Verificar que `npm run build` y `npm run lint` siguen pasando.
```

---

### JB-010 — Crear `.env.example` documentado

**Épica:** EPIC-1 · **Tipo:** Task · **Prioridad:** High · **Estimación:** 0.25 · **Sprint:** 0

(Cubierto en JB-001, mantener como subtarea)

---

### JB-011 — Crear cliente Supabase (browser, server, middleware)

**Épica:** EPIC-1 · **Tipo:** Task · **Prioridad:** Highest · **Estimación:** 2 · **Sprint:** 0

**Prompt Claude Code:**

```
Crear los wrappers de cliente Supabase para Next.js App Router siguiendo el patrón oficial de @supabase/ssr.

1. `src/lib/supabase/client.ts` — cliente para Client Components (createBrowserClient)
2. `src/lib/supabase/server.ts` — cliente para Server Components y Server Actions (createServerClient con cookies de next/headers)
3. `src/lib/supabase/middleware.ts` — utilidad para refresh de sesión usada en `middleware.ts`
4. `middleware.ts` en la raíz de `src/` que invoque el helper para todas las rutas excepto _next/static, _next/image, favicon.ico
5. Tipar todo con `Database` desde `src/types/database.ts` (que está vacío todavía — hacer un import condicional)

Las URLs y keys vienen de process.env. NO uses la service role key en estos clients.

Verificá que el build pase. No conectes ninguna page todavía.
```

---

### JB-012 — Crear `error.tsx` y `not-found.tsx` premium

**Épica:** EPIC-1 · **Tipo:** Task · **Prioridad:** Medium · **Estimación:** 1 · **Sprint:** 0

**Prompt Claude Code:**

```
Crear páginas de error y 404 alineadas con el diseño premium del prototipo.

1. `src/app/not-found.tsx` — 404 con tipografía serif grande "404", mensaje claro "La página que buscás no existe", botón "Volver al inicio". Centrado vertical y horizontal. Usar Header y Footer del layout público.

2. `src/app/error.tsx` (Client Component, requiere "use client" y props { error, reset }) — mensaje genérico "Algo salió mal", botón "Reintentar" que llama reset(). Mismo estilo.

3. `src/app/(public)/error.tsx` y `src/app/admin/error.tsx` para errores específicos por sección.

Mantener la estética sobria: spacing generoso, tipografía DM Serif para "404", DM Sans para texto, color de acento sutil. Sin emojis.
```

---

### JB-013 — Estructura `src/types/`

**Épica:** EPIC-1 · **Tipo:** Task · **Prioridad:** High · **Estimación:** 0.25 · **Sprint:** 0

**Prompt Claude Code:**

```
Crear `src/types/database.ts` con un placeholder mínimo:

export type Database = {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};

Esto evita errores de tipos hasta que `supabase gen types` lo regenere. No commiteamos las migraciones todavía, así que esto queda como stub.
```

---

### JB-014 — README técnico de arquitectura

**Épica:** EPIC-11 · **Tipo:** Task · **Prioridad:** Low · **Estimación:** 1 · **Sprint:** 0

**Prompt Claude Code:**

```
Actualizar `README.md` del proyecto con:
- Descripción del proyecto
- Stack técnico
- Setup local (env, migrations, dev)
- Comandos disponibles (dev, build, lint, format, db:*)
- Estructura de carpetas (alto nivel)
- Link a `docs/` para detalles

Tono profesional, breve, sin emojis.
```

---

## EPIC-2 — AUTENTICACIÓN & USUARIOS

### JB-101 a JB-105 — Migraciones DB básicas

**Tipo:** Task · **Prioridad:** Highest · **Sprint:** 1

#### JB-101 — Migración 001: extensions y enums

**Prompt Claude Code:**

```
Crear `supabase/migrations/20260501000001_init_extensions_enums.sql` con:
- create extension uuid-ossp, pg_trgm, pgcrypto
- enums: user_role, post_status, comment_status, case_status, case_priority, moderation_target, moderation_action

Tomá el SQL exacto de docs/04-ARQUITECTURA-SUPABASE.md sección Migration 001.

NO corras `supabase db push` todavía — esa decisión la toma el dev cuando esté listo.
```

#### JB-102 — Migración 002: profiles + trigger

**Prompt Claude Code:**

```
Crear `supabase/migrations/20260501000002_profiles.sql` con:
- tabla profiles (ver docs/04-ARQUITECTURA-SUPABASE.md sección Migration 002)
- trigger handle_new_user en auth.users

Después correr `npm run db:push` y luego `npm run db:types` para regenerar `src/types/database.ts`.
```

#### JB-103 — Migración 003: categorías y tags + seeds

**Prompt Claude Code:**

```
Crear `supabase/migrations/20260501000003_categories_tags.sql` con tablas categories, tags, post_tags (M:N) y seed inicial de categorías y tags exactamente como en docs/04-ARQUITECTURA-SUPABASE.md.

Aplicar con `npm run db:push`. Regenerar tipos.
```

#### JB-104 — RLS policies para profiles, categorías, tags

**Prompt Claude Code:**

```
Crear `supabase/migrations/20260501000004_rls_profiles_taxonomy.sql` con:
- enable RLS en profiles, categories, tags, post_tags
- helper function `is_admin()` security definer
- policies para profiles (select público, update self, admin update all)
- policies para categorías y tags (select público, all admin)

Aplicar y regenerar tipos.
```

#### JB-105 — Generar types DB

**Prompt Claude Code:**

```
Correr `npm run db:types` y commitear el archivo regenerado `src/types/database.ts`. Verificar que TypeScript no tenga errores con `npm run build`.
```

---

### JB-106 — Página `/auth/login`

**Tipo:** Story · **Prioridad:** Highest · **Estimación:** 2 · **Sprint:** 1

**Prompt Claude Code:**

```
Crear `src/app/auth/login/page.tsx` con un formulario de login premium alineado al diseño del proyecto.

Requisitos:
- Layout simple sin Header/Footer (auth layout standalone)
- Card centrado con logo arriba (mismo "V" del header)
- Campos: email, password
- Validación con react-hook-form + zod (email format, password min 8)
- Estados: idle, submitting (botón disabled + spinner), error (mensaje arriba con border rojo sutil)
- Link a "/auth/registro" y "/auth/recuperar"
- Server Action en `src/app/auth/login/actions.ts` que llama supabase.auth.signInWithPassword
- En éxito redirect a la URL anterior o "/" (default)
- Toast de éxito con sonner
- En error: mensaje claro pero genérico ("Email o contraseña incorrectos")

Crear también `src/app/auth/layout.tsx` como layout standalone sin Header/Footer.

Diseño: aire, tipografía DM Serif para título "Iniciar sesión", inputs con foco premium, botón primary full-width.
```

---

### JB-107 — Página `/auth/registro`

**Tipo:** Story · **Prioridad:** Highest · **Estimación:** 2 · **Sprint:** 1

**Prompt Claude Code:**

```
Mismo patrón que JB-106 pero para registro. Archivo `src/app/auth/registro/page.tsx`.

Campos: display_name, email, password, password_confirm.
Validación zod: nombre 2-80 chars, email, password 8+ con al menos un número, match con confirmación.

Server Action: `signUp` que llama supabase.auth.signUp con `data.options.data.display_name`. El trigger handle_new_user crea el profile.

En éxito: toast "Te enviamos un email de confirmación" + redirect a `/auth/login`.

Manejo de errores: email ya en uso, password débil.
```

---

### JB-108 — Página `/auth/recuperar` y reset

**Tipo:** Story · **Prioridad:** High · **Estimación:** 1 · **Sprint:** 1

**Prompt Claude Code:**

```
Implementar flujo de recuperación de contraseña.

1. `src/app/auth/recuperar/page.tsx`: form con campo email. Server Action llama supabase.auth.resetPasswordForEmail con redirectTo a `/auth/reset-password`.
2. `src/app/auth/reset-password/page.tsx`: form con nueva contraseña + confirmación. Server Action llama supabase.auth.updateUser({ password }). Redirect a `/` con toast de éxito.

En Supabase Dashboard, configurar el email template "Reset password" para que apunte a la URL correcta.
```

---

### JB-109 — Middleware de auth

**Tipo:** Task · **Prioridad:** Highest · **Estimación:** 1 · **Sprint:** 1

**Prompt Claude Code:**

```
Conectar el middleware con Supabase para refresh automático de sesión.

`src/middleware.ts` y `src/lib/supabase/middleware.ts` ya existen (JB-011). Implementar la función `updateSession(request)` que:
- Crea cliente Supabase server con cookies de la request
- Llama supabase.auth.getUser() para refrescar la sesión
- Si la ruta empieza con "/admin" y el user no existe → redirect a /auth/login con `?redirectedFrom=<path>`
- Si la ruta empieza con "/admin" y el user no es admin (consulta profiles) → redirect a "/" con toast (vía query param)

matcher en `middleware.ts`:
- ['/((?!_next/static|_next/image|favicon.ico|api/.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)']
```

---

### JB-110 — Server actions auth

**Tipo:** Task · **Prioridad:** Highest · **Estimación:** 1 · **Sprint:** 1

**Prompt Claude Code:**

```
Crear `src/app/auth/actions.ts` con server actions reutilizables:
- signIn(formData)
- signUp(formData)
- signOut()
- resetPassword(email)
- updatePassword(password)

Cada una valida con zod, llama Supabase, maneja errores y redirige según corresponda. Usar revalidatePath cuando sea necesario.
```

---

### JB-111 — Hook `useUser()` + UserProvider

**Tipo:** Task · **Prioridad:** High · **Estimación:** 1 · **Sprint:** 1

**Prompt Claude Code:**

```
Crear un context de usuario para Client Components.

1. `src/lib/auth/UserProvider.tsx`: Client Component que recibe initial user y profile como props (server-fetched), expone via context.
2. Hook `useUser()` que retorna { user, profile, isAdmin, isLoading }.
3. Suscripción a `supabase.auth.onAuthStateChange` para actualizar el context al login/logout.
4. Wrappear en el root layout: en RootLayout server-fetch user con supabase.server() y pasar al provider.

No reemplaces el layout existente — agrego al árbol manteniendo el resto intacto.
```

---

### JB-112 — Header reactivo a la sesión

**Tipo:** Story · **Prioridad:** High · **Estimación:** 1 · **Sprint:** 1

**Prompt Claude Code:**

```
Conectar `src/components/layout/header.tsx` con el context de usuario.

Cambios:
- Si NO hay user: en lugar de "Panel", mostrar "Ingresar" → /auth/login
- Si HAY user: mostrar avatar (iniciales o foto) con dropdown que tenga: "Mi perfil" → /perfil, "Panel admin" (solo si isAdmin) → /admin, "Cerrar sesión" → ejecuta signOut()
- En mobile menu: misma lógica adaptada al menú colapsable

Reusar dropdown-menu de shadcn. Mantener motion underline y todo el resto del Header igual.
```

---

### JB-113 — Proteger layout `/admin/*`

**Tipo:** Task · **Prioridad:** Highest · **Estimación:** 0.5 · **Sprint:** 1

**Prompt Claude Code:**

```
En `src/app/admin/layout.tsx` (que es Client Component), agregar verificación server-side adicional usando un AdminGuard:

1. Crear `src/app/admin/AdminGuard.tsx` Server Component que:
   - Crea supabase server client
   - getUser() — si no existe redirect a /auth/login
   - Consulta profiles para verificar role='admin' — si no, redirect a "/"
2. Envolver children en el layout con AdminGuard.

El middleware ya cubre el caso, pero esto es defense-in-depth.
```

---

### JB-114 — Conectar `/perfil` real

**Tipo:** Story · **Prioridad:** High · **Estimación:** 1.5 · **Sprint:** 1

**Prompt Claude Code:**

```
Convertir `/perfil` en Client Component conectado.

Server Component wrapper que:
- Obtiene el profile del usuario logueado
- Pasa a Client Component con el formulario

Client Component:
- Formulario react-hook-form con campos display_name, bio, avatar_url
- Validación zod (mismas reglas que la migración)
- Server Action updateProfile(formData) que actualiza la fila en profiles
- Toast de éxito
- Stats reales (count de comments y threads del usuario) calculadas server-side

Los datos hardcoded de "Laura Giménez" se reemplazan por los reales.
```

---

### JB-115 — Upload de avatar a Storage

**Tipo:** Task · **Prioridad:** Medium · **Estimación:** 1.5 · **Sprint:** 1

**Prompt Claude Code:**

```
Crear el bucket `avatars` en Supabase Storage (público) con policies que permiten al usuario subir su propio avatar.

Migración SQL: `supabase/migrations/20260501000005_storage_avatars.sql`:
- insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true) on conflict do nothing
- policies: avatars_insert_self, avatars_update_self, avatars_select_public, avatars_delete_self

En `/perfil`, agregar componente `<AvatarUploader />`:
- Drop / click para seleccionar imagen
- Validación: max 1 MB, formatos jpg/png/webp
- Upload a `avatars/{user_id}/{filename}` con supabase.storage.from('avatars').upload (upsert true)
- Después de upload: getPublicUrl y guardar en profiles.avatar_url
- Optimistic UI: mostrar preview inmediato

Componente reutilizable (mismo patrón se usará para post-images en Sprint 2).
```

---

### JB-116 — Conectar `/admin/usuarios` real

**Tipo:** Story · **Prioridad:** Medium · **Estimación:** 1 · **Sprint:** 1

**Prompt Claude Code:**

```
Reemplazar mockUsers en `/admin/usuarios` por queries Supabase a profiles + auth.users.

Server Component que lista todos los profiles con joins de auth.users (email, last_sign_in_at).

Mantener exactamente la UI actual. Cambiar solo la fuente de datos. Filtros por rol funcionan via query param + server filter.

Loading state con skeleton, empty state con `<EmptyState />`.
```

---

### JB-117 — Acción admin: cambiar rol de usuario

**Tipo:** Task · **Prioridad:** Medium · **Estimación:** 0.5 · **Sprint:** 1

**Prompt Claude Code:**

```
En `/admin/usuarios`, agregar opción en el menú "..." de cada fila para "Cambiar a admin" / "Cambiar a usuario". Server Action que actualiza profiles.role.

Confirmar con dialog (shadcn AlertDialog). Toast post-acción. Revalidate la página.

Validar que un admin no pueda quitarse el rol a sí mismo (UI + server-side).
```

---

### JB-118 — Validaciones zod compartidas para auth

**Tipo:** Task · **Prioridad:** Medium · **Estimación:** 0.5 · **Sprint:** 1

**Prompt Claude Code:**

```
Crear `src/lib/validators/auth.ts` con schemas zod reutilizables:
- loginSchema (email, password min 8)
- signupSchema (display_name, email, password, password_confirm con refine match)
- resetEmailSchema
- updatePasswordSchema

Importarlos desde las pages auth en lugar de duplicar.
```

---

## EPIC-3 — BLOG BACKEND

### JB-201 — Migración 004: posts + indices + tsvector

**Sprint:** 2 · **Prioridad:** Highest · **Estimación:** 1

**Prompt Claude Code:**

```
Crear `supabase/migrations/20260601000001_posts.sql` con la tabla posts completa según docs/04-ARQUITECTURA-SUPABASE.md sección Migration 004 (incluye search_vector generated, indices GIN, post_tags M:N).

Aplicar y regenerar types.
```

### JB-202 — RLS posts

**Sprint:** 2 · **Prioridad:** Highest · **Estimación:** 0.5

**Prompt Claude Code:**

```
Crear `supabase/migrations/20260601000002_rls_posts.sql` con:
- enable RLS posts, post_tags
- policy posts_select_published (público + admin)
- policy posts_admin_all (admin only)
- policy post_tags_select_with_post (si el post es visible)
- policy post_tags_admin_all

Aplicar y regenerar tipos.
```

### JB-203 — Bucket `post-images`

**Sprint:** 2 · **Prioridad:** Highest · **Estimación:** 0.5

**Prompt Claude Code:**

```
Crear `supabase/migrations/20260601000003_storage_post_images.sql`:
- crear bucket post-images público
- policies: insert/update/delete solo admin (usar is_admin()), select público

Aplicar.
```

### JB-204 — Componente `<RichTextEditor />` con TipTap

**Sprint:** 2 · **Prioridad:** Highest · **Estimación:** 3

**Prompt Claude Code:**

```
Reemplazar el textarea actual de `/admin/articulos/nuevo` por un editor TipTap real.

Crear `src/components/editor/RichTextEditor.tsx` (Client Component):
- TipTap con extensiones: StarterKit, Link, Image, Placeholder
- Toolbar con botones: heading 2/3, bold, italic, bullet/ordered list, blockquote, link (con dialog), image (que abre el ImageUploader), undo/redo
- Estilo: barra superior con border-b, área de edición con padding y prose
- Output: JSON (TipTap) y HTML sanitizado
- Props: value (JSON), onChange (JSON, html)

Crear `src/lib/editor/sanitize.ts`:
- función sanitizeHtml(html: string): string usando isomorphic-dompurify

El componente expone JSON + HTML al padre.
```

### JB-205 — Sanitizado server-side

**Sprint:** 2 · **Prioridad:** Highest · **Estimación:** 0.5

**Prompt Claude Code:**

```
En la server action que persiste un post (Sprint 2 JB-210), antes de guardar el HTML aplicar `sanitizeHtml()` con DOMPurify. Configurar whitelist: h2, h3, p, ul, ol, li, blockquote, strong, em, a (href, rel), img (src, alt), br, hr.

Esto protege contra XSS si el editor envía algo malicioso.
```

### JB-206 — `<ImageUploader />` reutilizable

**Sprint:** 2 · **Prioridad:** High · **Estimación:** 1.5

**Prompt Claude Code:**

```
Crear `src/components/shared/ImageUploader.tsx` (Client Component):
- Props: bucket, path (callback que recibe filename y devuelve la ruta), onUpload(url), maxSizeMB, accept
- Drag&drop + click para seleccionar
- Validación: tamaño, formato
- Upload con supabase.storage.from(bucket).upload
- Loading state con spinner
- Preview del archivo subido
- Delete del archivo subido (botón X)

Reutilizable para avatar y para post-images. Reemplazar el placeholder visual de imagen destacada en `/admin/articulos/nuevo` por este componente.
```

### JB-207 — `<CategorySelect />` server-driven

**Sprint:** 2 · **Prioridad:** Medium · **Estimación:** 0.5

**Prompt Claude Code:**

```
Crear `src/components/admin/CategorySelect.tsx`:
- Server Component que lee categories desde Supabase
- Renderiza un <select> de shadcn con las categorías
- Props: name, defaultValue, required

Usar en `/admin/articulos/nuevo` y `/admin/articulos/[id]`.
```

### JB-208 — `<TagSelector />` multi-select con creación inline

**Sprint:** 2 · **Prioridad:** Medium · **Estimación:** 1.5

**Prompt Claude Code:**

```
Crear `src/components/admin/TagSelector.tsx` (Client Component):
- Multi-select usando cmdk (shadcn Command)
- Búsqueda en vivo
- Si la query no matchea ningún tag → opción "Crear etiqueta: [query]" que llama una server action createTag
- Tags seleccionados se muestran como chips removibles
- Props: defaultTags, onChange(tagIds[])

Conectar a posts via post_tags M:N en la action de save (JB-210).
```

### JB-209 — `/admin/articulos` real con filtros

**Sprint:** 2 · **Prioridad:** Highest · **Estimación:** 2

**Prompt Claude Code:**

```
Convertir `/admin/articulos` en Server Component con datos reales.

Lectura: getAllPostsAdmin() con filtros opcionales por status, category, search query.
Filtros desde la URL (search params): ?status=draft&category=impuestos&q=reforma

Mantener la tabla actual. Los iconos de acción ya existen — conectar:
- Eye → href a `/blog/{slug}` o si es draft a un preview
- Pencil → href a `/admin/articulos/{id}` (page nueva en JB-211)
- Trash → AlertDialog confirma → server action deletePost(id) (soft delete)

Loading state con skeleton de tabla.
```

### JB-210 — `/admin/articulos/nuevo` editor real conectado

**Sprint:** 2 · **Prioridad:** Highest · **Estimación:** 3

**Prompt Claude Code:**

```
Conectar el editor con persistencia.

1. Server action `createPost(formData)` en `src/app/admin/articulos/actions.ts`:
   - Validación zod (titulo min 5 chars, content no vacío, status válido)
   - Generar slug único (slugify + check conflict)
   - Sanitizar content_html
   - Calcular read_time_minutes (~ 250 palabras / min)
   - Insertar post + post_tags
   - Si status='scheduled' validar scheduled_for futuro
   - Si status='published' setear published_at = now()
   - Subir imagen destacada si viene
   - Revalidate /blog y /admin/articulos
   - Redirect a /admin/articulos con toast

2. Page `nuevo` ahora es Server + Client mixto:
   - Form completo con react-hook-form
   - Editor TipTap, ImageUploader, CategorySelect, TagSelector, status radio, scheduled_for date input
   - Botones "Guardar borrador" y "Publicar" llaman action con status correspondiente

Mantener el diseño actual exactamente.
```

### JB-211 — `/admin/articulos/[id]` editar

**Sprint:** 2 · **Prioridad:** Highest · **Estimación:** 1.5

**Prompt Claude Code:**

```
Crear `src/app/admin/articulos/[id]/page.tsx` para editar.

Server Component lee post por ID. Pasa a Client form. Action updatePost(id, formData) similar a createPost pero UPDATE.

Reusar todos los componentes (RichTextEditor con value inicial, ImageUploader con imagen actual, etc.).

Botones: "Guardar cambios", "Despublicar" (status = draft), "Eliminar" (soft delete con confirm).
```

### JB-212 — Acciones publicar/programar/borrador

**Sprint:** 2 · **Prioridad:** High · **Estimación:** 0.5

(Cubierto en JB-210 / JB-211 como parte del form)

### JB-213 — Soft delete posts

**Sprint:** 2 · **Prioridad:** Medium · **Estimación:** 0.5

**Prompt Claude Code:**

```
Implementar soft delete en posts. Server action deletePost(id):
- UPDATE posts SET deleted_at = now() WHERE id = $1
- Revalidate /admin/articulos y /blog
- Toast

NO hard delete. Los registros con deleted_at no aparecen por RLS (o filtro en queries).
```

### JB-214 — Auto-cálculo de read_time y slug único

**Sprint:** 2 · **Prioridad:** Medium · **Estimación:** 0.5

**Prompt Claude Code:**

```
Crear `src/lib/utils/text.ts`:
- slugify(title): string usando regex (lowercase, accents removed, spaces → -)
- ensureUniqueSlug(supabase, slug): agrega -2, -3, etc. si existe
- estimateReadTime(html): minutos basados en ~250 wpm sobre el plain text del HTML

Usar en createPost y updatePost.
```

### JB-215 — `/admin/programados` real

**Sprint:** 2 · **Prioridad:** Medium · **Estimación:** 1

**Prompt Claude Code:**

```
Convertir `/admin/programados` en Server Component con datos reales.

Dos secciones:
- Programados: posts con status='scheduled' y scheduled_for futuro
- Borradores: posts con status='draft'

Acciones rápidas:
- Editar → /admin/articulos/{id}
- Eliminar → soft delete con confirm
- "Publicar ahora" en programados → cambia status a published, published_at = now(), scheduled_for = null

Mantener UI actual.
```

### JB-216 — Función publish_scheduled_posts + cron

**Sprint:** 2 · **Prioridad:** High · **Estimación:** 1

**Prompt Claude Code:**

```
Crear `supabase/migrations/20260601000010_scheduled_publish.sql`:
- create extension pg_cron
- function publish_scheduled_posts() que UPDATEa posts a published cuando scheduled_for <= now()
- cron.schedule cada 5 min

Aplicar. Verificar que pg_cron esté disponible en el plan de Supabase del cliente (free tier no lo tiene — verificar requisito).

Si el plan no lo soporta: alternativa con Edge Function disparada por Vercel Cron en /api/cron/publish.
```

### JB-217 — `/blog` real con paginación, filtros, búsqueda

**Sprint:** 2 · **Prioridad:** Highest · **Estimación:** 2

**Prompt Claude Code:**

```
Convertir `/blog` en Server Component conectado.

Search params:
- ?page=1
- ?cat=impuestos
- ?tag=iva
- ?q=reforma

Query Supabase con paginación (10 por página), filtros por category_id, post_tags.tag_id, y búsqueda full-text:
WHERE search_vector @@ plainto_tsquery('spanish', $q)

Sidebar dinámica:
- Categorías con count real
- Tags populares (top 10 por count en post_tags)
- Artículos recientes reales (últimos 4)

SearchBar conecta con form que actualiza ?q=. Pagination conecta con ?page=.

Mantener UI actual.
```

### JB-218 — `/blog/[slug]` real

**Sprint:** 2 · **Prioridad:** Highest · **Estimación:** 1.5

**Prompt Claude Code:**

```
Convertir `/blog/[slug]` en Server Component.

- getPostBySlug(slug) — si no existe → notFound()
- Render content_html dentro de prose-premium
- Sidebar conectada (categorías, recientes)
- generateMetadata(post) para SEO (title, description, og:image)
- Increment view_count vía RPC (Edge Function track-post-view) en server action o useEffect cliente con dedupe

El form de comentarios queda hasta Sprint 3 (no funcional en este sprint, pero conectar lectura de comentarios aprobados via getApprovedCommentsByPost).
```

### JB-219 — Tracking views (Edge Function)

**Sprint:** 2 · **Prioridad:** Low · **Estimación:** 1

**Prompt Claude Code:**

```
Crear Edge Function `supabase/functions/track-post-view/index.ts`:
- POST con { post_slug }
- Hash IP + user-agent → ip_hash
- Si no hay otra view del mismo ip_hash en últimas 24h → INSERT en post_views + UPDATE posts.view_count
- Devuelve 200 ok

En `/blog/[slug]/page.tsx` (Server Component) llamar a la function vía fetch en un Server Action o desde un Client Component con useEffect.

Decisión: para no penalizar SSR, hacerlo en Client Component aparte que se monta y dispara fire-and-forget.
```

### JB-220 — Migración seeds + admin CRUD categorías

**Sprint:** 2 · **Prioridad:** Medium · **Estimación:** 1.5

(Cubierto en JB-103 + JB-221)

### JB-221 — `/admin/categorias` real CRUD

**Sprint:** 2 · **Prioridad:** Medium · **Estimación:** 2

**Prompt Claude Code:**

```
Convertir `/admin/categorias` en CRUD real para categories y tags.

Server Component lee categorías y tags. Client Component para forms.

Acciones:
- createCategory({ name, description, slug })
- updateCategory(id, ...)
- deleteCategory(id) — soft o hard delete; verificar dependencias (posts usando esa categoría)
- createTag({ name, slug })
- deleteTag(id)

Validaciones zod:
- name 2-50
- slug auto-generado desde name (con override manual)

Manejar caso: eliminar categoría con posts asociados → mostrar warning, ofrecer mover posts a otra cat.

Mantener UI actual exacta.
```

### JB-222 — SEO básico blog

**Sprint:** 2 · **Prioridad:** High · **Estimación:** 1

**Prompt Claude Code:**

```
Implementar metadata para SEO en blog:

1. `/blog/page.tsx`: export const metadata estática
2. `/blog/[slug]/page.tsx`: export async function generateMetadata({ params }) que retorna:
   - title: post.title
   - description: post.excerpt
   - openGraph: { title, description, images: [post.featured_image], type: 'article', publishedTime: post.published_at, authors: [post.author.name] }
   - twitter: { card: 'summary_large_image' }
3. JSON-LD Article schema en script tag (BlogPosting con headline, datePublished, author, image)
```

### JB-223 — Sitemap.xml

**Sprint:** 2 · **Prioridad:** Medium · **Estimación:** 0.5

**Prompt Claude Code:**

```
Crear `src/app/sitemap.ts` (App Router sitemap convention) que retorna array de:
- URLs estáticas (/, /sobre-nosotros, /blog, /foros, /contacto)
- URLs dinámicas: posts publicados con lastModified=updated_at, priority 0.8
- URLs de categorías y forum categories

También crear `src/app/robots.ts` permitiendo todo y apuntando al sitemap.
```

### JB-224 — accent_color por artículo

**Sprint:** 2 · **Prioridad:** Medium · **Estimación:** 1

**Prompt Claude Code:**

```
Implementar variación de color por artículo según pidió el cliente.

1. Migración: ALTER TABLE posts ADD COLUMN accent_color text. Default null.
2. En `/admin/articulos/nuevo` y `[id]`: agregar color picker simple (5-6 presets: ámbar, verde, azul, rojo, violeta, slate). Si no se elige, hereda de la categoría.
3. Migración: ALTER TABLE categories ADD COLUMN accent_color text default '#d97706' (ámbar).
4. En el render de `/blog/[slug]`: aplicar el color como CSS variable que tinta el badge de categoría, el blockquote border, y un sutil tinte en el hero del artículo.

Subtle, no chillón. Variación visible pero coherente con el diseño premium.
```

---

## EPIC-4 — COMENTARIOS Y MODERACIÓN

### JB-301 — Migración 005: comments

**Sprint:** 3 · **Prioridad:** Highest · **Estimación:** 0.5

**Prompt Claude Code:**

```
Crear `supabase/migrations/20260701000001_comments.sql` con tabla comments según docs/04. Aplicar y regenerar tipos.
```

### JB-302 — RLS comments

**Sprint:** 3 · **Prioridad:** Highest · **Estimación:** 0.5

**Prompt Claude Code:**

```
Crear `supabase/migrations/20260701000002_rls_comments.sql` con policies:
- comments_select_approved (public approved + admin all + self all)
- comments_insert_anyone (auth or anon con email)
- comments_admin_modify
- comments_admin_delete

Aplicar.
```

### JB-303 — `<CommentForm />` con honeypot + rate-limit

**Sprint:** 3 · **Prioridad:** High · **Estimación:** 2

**Prompt Claude Code:**

```
Crear `src/components/blog/CommentForm.tsx` (Client Component):
- Si user logueado: form con solo campo content. author_id = user.id.
- Si no logueado: form con name, email, content.
- Honeypot: input hidden con aria-hidden=true llamado "website" — si se llena, descartar.
- Rate-limit: localStorage timestamp de último envío < 60 seg → no permitir.
- Server action createComment(formData):
  - validación zod (content 2-2000 chars)
  - rate limit server-side por IP (consulta últimos 60 seg con misma IP)
  - sanitización content
  - INSERT con status='pending'
  - Trigger Edge Function de notificación (Sprint 3 más adelante)
  - return success o error
- En éxito: toast "Tu comentario está pendiente de aprobación", limpiar form.
```

### JB-304 — `<CommentItem />` con replies

**Sprint:** 3 · **Prioridad:** Medium · **Estimación:** 1

**Prompt Claude Code:**

```
Crear `src/components/blog/CommentItem.tsx` que renderiza un comentario y sus replies (1 nivel).

Props: comment con sus replies array. Si user es admin, botón "Responder" aparece y abre un mini-form (textarea + enviar).

Layout:
- Avatar (iniciales si no hay)
- Nombre + fecha
- Content
- Si tiene replies: línea vertical guía + replies indentadas

Reusar los styles del prototipo (la lista de comentarios ya está, solo organizarla en componente).
```

### JB-305 — Conectar comentarios en `/blog/[slug]`

**Sprint:** 3 · **Prioridad:** Highest · **Estimación:** 1.5

**Prompt Claude Code:**

```
Reemplazar la lista hardcoded en `/blog/[slug]` por:
1. getApprovedCommentsByPost(slug) que devuelve solo aprobados, ordenados por fecha asc, con replies anidadas.
2. Render con `<CommentItem />`.
3. `<CommentForm />` al final.
4. Mostrar count real.
```

### JB-306 — `/admin/comentarios` real con filtros

**Sprint:** 3 · **Prioridad:** Highest · **Estimación:** 1.5

**Prompt Claude Code:**

```
Convertir `/admin/comentarios` en Server Component con datos reales.

Filtros (?status=pending|approved|rejected, ?q=, ?post=).

Mantener UI exacta. Los botones de aprobar/rechazar/eliminar conectan a server actions (JB-307).
```

### JB-307 — Acciones moderación con moderation_logs

**Sprint:** 3 · **Prioridad:** Highest · **Estimación:** 1

**Prompt Claude Code:**

```
Server actions:
- approveComment(id, reason?)
- rejectComment(id, reason?)
- deleteComment(id, reason?)

Cada una:
1. Verifica is_admin
2. UPDATE comment status (o soft delete)
3. INSERT en moderation_logs
4. Si approve: trigger Edge Function send-comment-approved (JB-310)
5. revalidatePath /blog/[slug] y /admin/comentarios
6. toast

Optimistic UI con useOptimistic en el client.
```

### JB-308 — Admin responder comentario

**Sprint:** 3 · **Prioridad:** High · **Estimación:** 1

**Prompt Claude Code:**

```
En `/admin/comentarios` y `/blog/[slug]` (modo admin), agregar acción "Responder" en cada comentario.

Crea un comment con parent_id = comment.id, author_id = admin, status='approved' automáticamente (admin no necesita moderación propia).

UI: botón "Responder" abre dialog con textarea, validación, submit.
```

### JB-309 — Edge Function send-comment-notification

**Sprint:** 3 · **Prioridad:** Medium · **Estimación:** 1

**Prompt Claude Code:**

```
Crear `supabase/functions/send-comment-notification/index.ts`:
- Triggered desde DB trigger en INSERT comments con status=pending
- Recibe { comment_id, post_slug, author_name, content_excerpt }
- Llama Resend API con template HTML simple
- Email al admin (env RESEND_NOTIFY_EMAIL)
- Subject: "Nuevo comentario pendiente de moderación"

Configurar el trigger DB en migración: AFTER INSERT ON comments → call edge function via pg_net o via Supabase webhook.
```

### JB-310 — Edge Function send-comment-approved

**Sprint:** 3 · **Prioridad:** Low · **Estimación:** 0.5

**Prompt Claude Code:**

```
Edge Function que envía email al autor del comentario cuando es aprobado.

Trigger: en server action approveComment después del UPDATE. Llamar la Edge Function con { comment_id, recipient_email }.

Template: "Tu comentario en [post title] fue aprobado. Verlo en [URL]".
```

---

## EPIC-5 — FOROS

### JB-311 — Migración 006: forums

**Sprint:** 3 · **Prioridad:** Highest · **Estimación:** 1

**Prompt Claude Code:**

```
Crear `supabase/migrations/20260701000010_forums.sql` con forum_categories, forum_threads, forum_replies + indices + tsvector según docs/04. Seeds de forum_categories.

Aplicar y regenerar tipos.
```

### JB-312 — RLS forums

**Sprint:** 3 · **Prioridad:** Highest · **Estimación:** 0.5

**Prompt Claude Code:**

```
Crear `supabase/migrations/20260701000011_rls_forums.sql` con policies según docs/04 sección RLS. Aplicar.
```

### JB-313 — Trigger reply count

**Sprint:** 3 · **Prioridad:** Medium · **Estimación:** 0.5

**Prompt Claude Code:**

```
Crear `supabase/migrations/20260701000012_trigger_replies_count.sql` con la función update_thread_reply_stats y el trigger en forum_replies. Ver docs/04 Migration 010.
```

### JB-314 — `/foros` real

**Sprint:** 3 · **Prioridad:** Highest · **Estimación:** 1

**Prompt Claude Code:**

```
Convertir `/foros` en Server Component:
- Lista de forum_categories con threadCount, replyCount, lastActivity (calculados en queries)
- Sección "Actividad reciente": últimos 4 threads ordenados por last_reply_at desc

Mantener UI exacta.
```

### JB-315 — `/foros/[category]` real

**Sprint:** 3 · **Prioridad:** Highest · **Estimación:** 1.5

**Prompt Claude Code:**

```
Convertir `/foros/[category]` en Server Component con paginación + búsqueda.

Search params: ?page, ?q.
Threads pinned arriba, luego ordenados por last_reply_at desc.

Botón "Nuevo hilo" abre modal/sheet con `<NewThreadForm />` (JB-317).
```

### JB-316 — `/foros/[category]/[thread]` real

**Sprint:** 3 · **Prioridad:** Highest · **Estimación:** 1.5

**Prompt Claude Code:**

```
Convertir el detalle de hilo en Server Component:
- Thread + replies ordenados asc
- Render `<ReplyForm />` al final si user logueado y thread no locked
- Increment view_count via Edge Function similar a posts

Mantener UI.
```

### JB-317 — `<NewThreadForm />`

**Sprint:** 3 · **Prioridad:** High · **Estimación:** 1.5

**Prompt Claude Code:**

```
Componente Client que muestra form en Sheet (shadcn) con:
- title (5-200 chars)
- content (10+ chars)
- category preselected si vino del path

Server action createThread:
- validation zod
- INSERT
- generar slug único en (category_id, slug)
- redirect al thread nuevo
- toast

Solo accesible si user logueado, sino redirect a /auth/login con redirectedFrom.
```

### JB-318 — `<ReplyForm />`

**Sprint:** 3 · **Prioridad:** High · **Estimación:** 1

**Prompt Claude Code:**

```
Componente con textarea + botón Publicar. Server action createReply(thread_id, content). Validación min 2 chars max 5000. Rate limit 30 seg. Anti-spam básico.

UI: aparece al final del thread si user logueado y thread no locked. Sino mensaje "Iniciá sesión para responder" o "Hilo cerrado".
```

### JB-319 — `/admin/foros` real

**Sprint:** 3 · **Prioridad:** Medium · **Estimación:** 2

**Prompt Claude Code:**

```
Convertir admin de foros:
- CRUD de forum_categories (igual que blog categorías)
- Lista de hilos recientes con acciones de moderación

Mantener UI.
```

### JB-320 — Acciones admin foros

**Sprint:** 3 · **Prioridad:** Medium · **Estimación:** 1

**Prompt Claude Code:**

```
Server actions de moderación de threads:
- pinThread(id) / unpinThread(id)
- lockThread(id) / unlockThread(id)
- hideThread(id) / unhideThread(id)
- deleteThread(id) (soft)
- deleteReply(id) (soft)

Cada una loguea en moderation_logs.
```

### JB-321 — Búsqueda full-text en foros

**Sprint:** 3 · **Prioridad:** Medium · **Estimación:** 1

**Prompt Claude Code:**

```
Conectar la barra de búsqueda en /foros y /foros/[category] con search_vector @@ plainto_tsquery. Resultados con highlight (ts_headline opcional). Paginación.
```

### JB-322 — Anti-spam threads y replies

**Sprint:** 3 · **Prioridad:** Medium · **Estimación:** 0.5

**Prompt Claude Code:**

```
En createThread y createReply:
- Rate limit por user_id: max 5 posts/hora, max 3 threads/día
- Detección básica de spam: regex para URLs sospechosas, cantidad de mayúsculas, repetición
- Si flag spam: insert con flag o status hidden, log para revisión

Honeypot en forms.
```

---

## EPIC-6 — CASOS

### JB-401 — Migración 007: cases + case_messages

**Sprint:** 4 · **Prioridad:** Highest · **Estimación:** 1

**Prompt Claude Code:**

```
Crear `supabase/migrations/20260801000001_cases.sql` con cases y case_messages según docs/04. Incluye sequence case_code_seq.

Aplicar.
```

### JB-402 — RLS cases

**Sprint:** 4 · **Prioridad:** Highest · **Estimación:** 0.5

**Prompt Claude Code:**

```
RLS según docs/04: insert público, select admin, update admin. case_messages all admin.
```

### JB-403 — `/contacto` crea caso

**Sprint:** 4 · **Prioridad:** Highest · **Estimación:** 1.5

**Prompt Claude Code:**

```
Convertir el form de `/contacto` en funcional. Server action createCase(formData):
- Validación zod (name, email, subject, message; phone opcional)
- INSERT con status=new, priority=medium
- Trigger Edge Function send-case-notification
- Devolver el code generado al cliente
- Mostrar pantalla de éxito con código + texto "Te enviamos un email con tu código de seguimiento"

Mantener UI del form actual exacta.
```

### JB-404 — `/seguimiento` consulta por código + email

**Sprint:** 4 · **Prioridad:** High · **Estimación:** 1.5

**Prompt Claude Code:**

```
Crear `src/app/(public)/seguimiento/page.tsx`:
- Form con campos: código, email
- Server action o llamada a Edge Function `case-public-status`
- Si match: mostrar estado, prioridad, fecha, último mensaje visible (no internal)
- Si no match: mensaje genérico "No encontramos un caso con esos datos"

Diseño premium consistente con el resto.
```

### JB-405 — Edge Function case-public-status

**Sprint:** 4 · **Prioridad:** High · **Estimación:** 1

**Prompt Claude Code:**

```
Edge Function que valida code + email matchean y devuelve datos del caso (sin notas internas, solo public).

Rate limit por IP para evitar enumeración.
```

### JB-406 — `/admin/casos` listado

**Sprint:** 4 · **Prioridad:** High · **Estimación:** 1.5

**Prompt Claude Code:**

```
Crear `src/app/admin/casos/page.tsx`:
- Listado con filtros (status, prioridad, asignado, búsqueda)
- Tabla con columnas: code, name, subject (truncated), status, priority, assigned, created_at
- Acciones rápidas en cada fila

Estilo coherente con /admin/articulos.
```

### JB-407 — `/admin/casos/[id]` detalle

**Sprint:** 4 · **Prioridad:** High · **Estimación:** 2

**Prompt Claude Code:**

```
Crear `src/app/admin/casos/[id]/page.tsx`:
- Header con código, nombre, status badge, prioridad
- Datos de contacto
- Mensaje original
- Timeline de case_messages (separar internal de public visualmente)
- Form para agregar nuevo mensaje (toggle internal/visible)
- Sidebar con: cambiar status, prioridad, asignar, notas internas
```

### JB-408 — Acciones casos

**Sprint:** 4 · **Prioridad:** High · **Estimación:** 1

**Prompt Claude Code:**

```
Server actions:
- updateCaseStatus(id, status, message?)
- updateCasePriority(id, priority)
- assignCase(id, profile_id)
- addCaseMessage(id, message, is_internal)

Cada cambio de status no internal envía email al cliente.
```

### JB-409 — Mensaje cliente vs nota interna

**Sprint:** 4 · **Prioridad:** Medium · **Estimación:** 0.5

(Cubierto en JB-407, JB-408 con flag is_internal)

### JB-410 — Edge Functions case email

**Sprint:** 4 · **Prioridad:** High · **Estimación:** 1

**Prompt Claude Code:**

```
Crear:
- `supabase/functions/send-case-notification/index.ts`: en INSERT cases, envía 2 emails — uno al admin, otro al cliente con su código.
- `supabase/functions/send-case-status-update/index.ts`: en UPDATE cases.status, envía email al cliente con nuevo estado.

Templates HTML simples con branding. Disparados por DB triggers o por server actions.
```

---

## EPIC-8 — DASHBOARD

### JB-411 — Migración 008: post_views + moderation_logs

**Sprint:** 4 · **Prioridad:** High · **Estimación:** 0.5

**Prompt Claude Code:**

```
Crear `supabase/migrations/20260801000010_views_modlogs.sql` con post_views y moderation_logs según docs/04.
```

### JB-412 — `/admin` dashboard real

**Sprint:** 4 · **Prioridad:** Highest · **Estimación:** 2

**Prompt Claude Code:**

```
Reemplazar dashboardStats hardcoded por queries reales:
- count posts publicados, borradores, programados
- count comments pendientes
- count threads activos
- count profiles
- sum post_views del mes actual + cálculo trend vs mes anterior
- count cases abiertos

Cards conectadas. Top 5 posts por view_count.

Comentarios pendientes (sección): ya existe, conectar query real.
Últimos posts: query real.
```

### JB-413 — Chart visitas 30 días

**Sprint:** 4 · **Prioridad:** Medium · **Estimación:** 1

**Prompt Claude Code:**

```
Agregar componente `<ViewsChart />` en /admin con line chart de visitas últimos 30 días.

Usar recharts o un wrapper de shadcn/charts. Datos agregados por día desde post_views.

Diseño minimalista, mismo color principal que el resto del admin.
```

### JB-414 — Top 5 artículos

**Sprint:** 4 · **Prioridad:** Low · **Estimación:** 0.5

**Prompt Claude Code:**

```
Card "Más leídos" en dashboard con top 5 posts por view_count.
```

### JB-415 — Card casos abiertos

**Sprint:** 4 · **Prioridad:** Medium · **Estimación:** 0.25

(Cubierto en JB-412)

---

## EPIC-9 — VISUAL & UX (Hero, WhatsApp, servicios)

### JB-501 — `<WhatsAppButton />` floating + inline

**Sprint:** 5 · **Prioridad:** High · **Estimación:** 1

**Prompt Claude Code:**

```
Crear `src/components/shared/WhatsAppButton.tsx`:
- Variante "floating": fixed bottom-right, círculo verde con icono WhatsApp, hover sutil
- Variante "inline": botón inline para CTAs de formularios
- Props: variant, message? (texto pre-rellenado), label?
- Genera href: `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`

Usar lucide MessageCircle o brand SVG si lo provee el cliente.

Insertar la variante floating en el layout público (`(public)/layout.tsx`) salvo en /admin.
```

### JB-502 — WhatsApp en formularios

**Sprint:** 5 · **Prioridad:** High · **Estimación:** 0.5

**Prompt Claude Code:**

```
Insertar `<WhatsAppButton variant="inline" />` en:
- /contacto (al lado del botón submit)
- /sobre-nosotros (en el CTA)
- footer (al lado del botón "Email")

Mensajes pre-rellenados según contexto (ej. "Hola, quiero hacer una consulta sobre [tema]").
```

### JB-503 — `<HeroCarousel />`

**Sprint:** 5 · **Prioridad:** High · **Estimación:** 2

**Prompt Claude Code:**

```
Crear `src/components/home/HeroCarousel.tsx` Client Component:
- Recibe array de slides ({ image, headline, subheadline, cta })
- Auto-rotate cada 6 segundos con fade transition (Framer Motion)
- Pause on hover
- Dots de navegación abajo
- Responsive (imágenes optimizadas con next/image)
- Mantener tipografía y diseño del hero actual
```

### JB-504 — Datos del carousel desde Supabase

**Sprint:** 5 · **Prioridad:** Medium · **Estimación:** 1

**Prompt Claude Code:**

```
Crear migración tabla `home_slides`:
- id, headline, subheadline, image_url, cta_text, cta_href, display_order, is_active, created_at, updated_at

RLS: select público, all admin.

Admin CRUD básico en `/admin/home` (página simple para gestionar slides).

Conectar HeroCarousel con queryHomeSlides() server-side.
```

### JB-505 — Home: menos texto + más visuales

**Sprint:** 5 · **Prioridad:** High · **Estimación:** 2

**Prompt Claude Code:**

```
Aplicar feedback del cliente: en la home, reducir bloques de texto, agregar más iconografía y espacio visual.

Cambios sugeridos en `src/app/(public)/page.tsx`:
- Hero: ya con carousel JB-503
- Stats: reducir texto y agregar iconos sutiles
- Servicios: alternar iconos lucide con micro-ilustraciones (sutiles, monocromas)
- CTA: más limpio
- Considerar agregar sección "Trabajamos con" con logos placeholder

Mantener identidad premium. Sin emojis. No exagerar.
```

### JB-506 — Página `/servicios/[slug]` template

**Sprint:** 5 · **Prioridad:** High · **Estimación:** 2

**Prompt Claude Code:**

```
Crear `src/app/(public)/servicios/[slug]/page.tsx` Server Component:
- Hero con título del servicio + imagen
- Descripción detallada (markdown o rich content)
- Lista de sub-servicios o features
- CTA: contacto + WhatsApp inline
- Sidebar con artículos del blog relacionados (filter por tag/categoría)

Diseño consistente con /sobre-nosotros pero más enfocado en un servicio específico.
```

### JB-507 — Migración services

**Sprint:** 5 · **Prioridad:** High · **Estimación:** 1

**Prompt Claude Code:**

```
Migración con tabla services:
- id, slug, name, description, hero_image, content (jsonb), display_order, is_active, related_category, accent_color, seo_title, seo_description, created_at, updated_at

RLS: select is_active público, all admin.

Seeds con 1-3 servicios placeholder.
```

### JB-508 — RLS services

**Sprint:** 5 · **Prioridad:** Medium · **Estimación:** 0.25

(Incluido en JB-507)

### JB-509 — Admin CRUD servicios

**Sprint:** 5 · **Prioridad:** High · **Estimación:** 2

**Prompt Claude Code:**

```
Crear `/admin/servicios` con CRUD igual que blog:
- Listado
- Editor (TipTap para content) + ImageUploader para hero
- Crear/editar/eliminar

Consistente con admin/articulos.
```

### JB-510 — Variación de color por blog (UI)

**Sprint:** 5 · **Prioridad:** Medium · **Estimación:** 1

(Cubierto en JB-224 más extensión a categorías)

### JB-511 — Editor: insertar imagen desde Storage

**Sprint:** 5 · **Prioridad:** Medium · **Estimación:** 1

**Prompt Claude Code:**

```
En el TipTap editor, el botón "Insertar imagen" debe:
1. Abrir un dialog
2. Subir nueva imagen (con ImageUploader) o seleccionar de existentes en bucket post-images
3. Insertar tag <img> con la URL pública

Browse de imágenes existentes: query del bucket con signed URL para preview.
```

### JB-512 — Página `/buscar`

**Sprint:** 5 · **Prioridad:** Medium · **Estimación:** 1

**Prompt Claude Code:**

```
Crear `/buscar` global con resultados de blog + foros + servicios.

Server Component lee ?q=. Tres tabs: Artículos | Foros | Servicios.

Las barras de búsqueda del header redirigen a /buscar?q=.
```

### JB-513 — Robots.txt + sitemap completo

**Sprint:** 5 · **Prioridad:** Medium · **Estimación:** 0.25

(Cubierto en JB-223)

### JB-514 — Open Graph dinámico

**Sprint:** 5 · **Prioridad:** Medium · **Estimación:** 1

**Prompt Claude Code:**

```
Crear `src/app/blog/[slug]/opengraph-image.tsx` (App Router OG image generation con next/og).

Genera una imagen 1200x630 con título del post, autor, fecha y branding. Inspirado en estilo editorial — fondo claro, tipografía DM Serif para título, slate para textos.
```

---

## EPIC-11 — QA & Production

### JB-601 a JB-620: tareas de QA, testing, hardening, deploy

(Detalladas en sección Sprint 6 del plan)

#### JB-601 — Suite Vitest unit

**Prompt:**

```
Setup Vitest + Testing Library. Crear tests unitarios para:
- src/lib/utils/text.ts (slugify, ensureUniqueSlug, estimateReadTime)
- src/lib/editor/sanitize.ts (sanitizeHtml con casos XSS)
- validators auth/post/comment

Configurar `npm test` y `npm test:watch`.
```

#### JB-602 — Playwright E2E

**Prompt:**

```
Setup Playwright. Crear test E2E del flujo crítico:
1. Visitor crea cuenta
2. Confirma email (mock o auto-confirm en test env)
3. Comenta en un post
4. Admin se loguea
5. Admin aprueba comentario
6. Visitante (sin login) ve el comentario en /blog/[slug]

Correr en CI.
```

#### JB-603 — Auditoría RLS

**Prompt:**

```
Crear script `scripts/audit-rls.ts` que:
1. Crea cuenta test no-admin
2. Intenta SELECT/INSERT/UPDATE/DELETE en cada tabla
3. Reporta qué pudo y qué no
4. Verifica que NO pueda leer borradores, casos, mod_logs, etc.
5. Falla si encuentra brechas
```

#### JB-604 — Auditoría XSS

**Prompt:**

```
Test que inserta payload XSS clásico (script, onerror, javascript:) en editor y verifica que el HTML persistido NO contiene esos vectores. Usar el sanitizeHtml directamente en unit tests.
```

#### JB-605 — Auditoría rate-limit

**Prompt:**

```
Script que envía 100 requests al endpoint createComment desde la misma IP en 60 seg. Verifica que solo los primeros pasen y el resto retorne 429.
```

#### JB-606 — Optimización imágenes

**Prompt:**

```
Audit de imágenes:
- Verificar que todas las imágenes en pages usen next/image
- Configurar `images.formats: ['image/avif', 'image/webp']`
- Configurar Storage transformaciones para resize on-the-fly
- Lazy loading por default en next/image
```

#### JB-607 — Lighthouse target

**Prompt:**

```
Correr Lighthouse CI en home y blog. Objetivo: ≥90 perf, ≥95 a11y, ≥100 SEO.

Si no llega: optimizar imágenes, lazy load components below fold, reducir JS bundle.
```

#### JB-608 — Resend setup

**Prompt:**

```
Configurar Resend:
1. Crear cuenta o usar existente del cliente
2. Verificar dominio del cliente
3. Crear template HTML con branding
4. Set RESEND_API_KEY y RESEND_FROM en Vercel env vars
5. Test de envío
```

#### JB-609 — Deploy Vercel

**Prompt:**

```
Conectar repo a Vercel:
1. Importar proyecto desde GitHub
2. Set env vars (NEXT_PUBLIC_*, SUPABASE_SERVICE_ROLE_KEY, RESEND_*, NEXT_PUBLIC_WHATSAPP_NUMBER, NEXT_PUBLIC_SITE_URL)
3. Configurar Preview deployments para PRs
4. Deploy a producción
```

#### JB-610 — Vercel env vars

(Cubierto en JB-609)

#### JB-611 — Dominio + SSL

**Prompt:**

```
Configurar dominio del cliente en Vercel. Verificar DNS. SSL automático. Redirect www → root o viceversa según preferencia.
```

#### JB-612 — Supabase backups

**Prompt:**

```
Habilitar Point-in-Time Recovery en Supabase (requiere plan Pro). Documentar política de backups: diarios a S3 (Edge Function) o usar el feature nativo.
```

#### JB-613 — Vercel Analytics

**Prompt:**

```
Habilitar @vercel/analytics y @vercel/speed-insights en el root layout.
```

#### JB-614 — Runbook incidentes

**Prompt:**

```
Crear `docs/RUNBOOK.md` con procedimientos para:
- Site caído → revisar Vercel status, Supabase status, logs
- Email no llega → revisar Resend logs, dominio
- Comentarios no se publican → revisar trigger DB, RLS
- Cron no corre → revisar pg_cron logs o Vercel cron

Cada uno con pasos paso a paso.
```

#### JB-615 — README onboarding

(Cubierto en JB-014, ampliar)

#### JB-616 — Página mantenimiento

**Prompt:**

```
Crear `public/maintenance.html` estática para activar manualmente cuando haya rollouts. Estética premium consistente.
```

#### JB-617 — Smoke tests post-deploy

**Prompt:**

```
GitHub Action que después de deploy a producción ejecuta smoke tests:
- /  → 200
- /blog → 200
- /api/health → 200 (crear endpoint)
- DB connection check
```

#### JB-618 — Capacitación cliente

**Prompt:**

```
Preparar:
1. Video screen-recording del panel admin (15-20 min) cubriendo: login, crear artículo, programar, moderar comentarios, gestionar casos.
2. Mini-manual PDF con screenshots y pasos clave.
3. Sesión live de 1h con el cliente para Q&A.
```

#### JB-619 — Plan de rollback

**Prompt:**

```
Documentar en `docs/ROLLBACK.md` cómo revertir:
- Deploy: Vercel → previous deployment con un clic
- Migración DB: down migration o restore point
- Edge Function: redeploy versión anterior
```

#### JB-620 — GitHub Actions CI

**Prompt:**

```
Crear `.github/workflows/ci.yml`:
- triggered on PR
- node 20
- npm ci, npm run lint, npm run build, npm test

Crear `.github/workflows/deploy.yml`:
- on push a main
- deploy via Vercel CLI

Status checks obligatorios para mergear.
```

---

## Resumen del backlog

| Epic                    | # Tasks                  | Esfuerzo (puntos)        |
| ----------------------- | ------------------------ | ------------------------ |
| EPIC-1 Infra & Setup    | 14                       | 14                       |
| EPIC-2 Auth             | 18                       | 24                       |
| EPIC-3 Blog backend     | 24                       | 36                       |
| EPIC-4 Comentarios      | 10                       | 12                       |
| EPIC-5 Foros            | 12                       | 16                       |
| EPIC-6 Casos            | 10                       | 14                       |
| EPIC-7 Storage          | (transversal)            | —                        |
| EPIC-8 Dashboard        | 5                        | 6                        |
| EPIC-9 Visual UX        | 14                       | 20                       |
| EPIC-10 Deuda técnica   | (incorporado en sprints) | —                        |
| EPIC-11 QA & Production | 20                       | 24                       |
| **Total**               | **~127 tareas**          | **~166 pts (~330-500h)** |

> Estimación total: 8-12 semanas para 1 dev senior trabajando dedicado.

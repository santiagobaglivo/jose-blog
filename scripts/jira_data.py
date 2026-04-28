"""Definición de épicas y tareas para Jira proyecto JB.

Estructura:
EPICS = [{ key, summary, description, priority }]
TASKS = [{ epic_key, summary, type, sprint, priority, estimacion, descripcion, contexto, objetivo, alcance, pasos, archivos, dependencias, criterios, qa, prompt }]
"""

EPICS = [
    {
        "key": "INFRA",
        "summary": "Infraestructura y Setup",
        "description": "Preparar Supabase, dependencias, refactor mínimo del prototipo y cimientos para conectar backend.",
        "priority": "Highest",
    },
    {
        "key": "AUTH",
        "summary": "Autenticación y Usuarios",
        "description": "Sistema completo de auth con Supabase: registro, login, recuperación, perfiles, roles (admin/user), guards de rutas.",
        "priority": "Highest",
    },
    {
        "key": "BLOG",
        "summary": "Blog backend",
        "description": "CRUD completo del blog: artículos, editor TipTap, categorías, tags, programación, búsqueda full-text, SEO.",
        "priority": "Highest",
    },
    {
        "key": "COMMENTS",
        "summary": "Comentarios y moderación",
        "description": "Sistema de comentarios con cola de moderación (pendiente/aprobado/rechazado), anti-spam y respuestas (1 nivel).",
        "priority": "High",
    },
    {
        "key": "FORUM",
        "summary": "Foros",
        "description": "Categorías de foros, hilos, respuestas, búsqueda y moderación (pin/lock/hide/delete).",
        "priority": "High",
    },
    {
        "key": "CASES",
        "summary": "Casos / Contacto con seguimiento",
        "description": "Formulario de contacto que crea casos con código único. Cliente puede consultar estado por código + email. Admin gestiona estados.",
        "priority": "High",
    },
    {
        "key": "DASH",
        "summary": "Dashboard y Métricas",
        "description": "Dashboard /admin con métricas reales: posts, comentarios, casos, visitas, top artículos, tendencias.",
        "priority": "Medium",
    },
    {
        "key": "VISUAL",
        "summary": "Visual y UX premium",
        "description": "Hero carousel, WhatsApp omnipresente, páginas de servicio, variación de color por blog, página de búsqueda global.",
        "priority": "High",
    },
    {
        "key": "STORAGE",
        "summary": "Storage y Media",
        "description": "Buckets Supabase Storage para imágenes destacadas, avatares, transformaciones y políticas.",
        "priority": "High",
    },
    {
        "key": "DEUDA",
        "summary": "Deuda técnica y Refactor",
        "description": "Refactorizaciones para escalabilidad: centralización de mappings, abstracción de queries, eliminación de duplicación.",
        "priority": "Low",
    },
    {
        "key": "QA",
        "summary": "QA, Hardening y Producción",
        "description": "Testing (unit + E2E), auditoría RLS/XSS/rate-limit, performance, deploy a Vercel, CI/CD, capacitación cliente.",
        "priority": "Highest",
    },
]


def T(epic, summary, sprint, priority, est, **kwargs):
    """Helper para construir tasks compactos."""
    return {
        "epic_key": epic,
        "summary": summary,
        "type": kwargs.pop("type", "Task"),
        "sprint": sprint,
        "priority": priority,
        "estimacion": est,
        "descripcion": kwargs.pop("descripcion", summary),
        "contexto": kwargs.pop("contexto", ""),
        "objetivo": kwargs.pop("objetivo", ""),
        "alcance": kwargs.pop("alcance", ""),
        "pasos": kwargs.pop("pasos", []),
        "archivos": kwargs.pop("archivos", []),
        "dependencias": kwargs.pop("dependencias", ""),
        "criterios": kwargs.pop("criterios", []),
        "qa": kwargs.pop("qa", []),
        "prompt": kwargs.pop("prompt", ""),
    }


# ============================================================================
# SPRINT 0 — INFRA & SETUP (epic: INFRA + DEUDA)
# ============================================================================

S0 = [
    T("INFRA", "Crear proyecto Supabase y variables de entorno", "Sprint 0", "Highest", 1,
      objetivo="Tener proyecto Supabase listo para recibir migraciones y conexiones desde Next.js",
      alcance=[
          "Crear proyecto en https://supabase.com (región sa-east-1)",
          "Anotar SUPABASE_URL, ANON_KEY, SERVICE_ROLE_KEY",
          "Crear .env.example y .env.local",
          "Verificar .gitignore",
      ],
      criterios=[
          "Proyecto Supabase creado",
          ".env.example documenta todas las variables",
          ".env.local con valores reales (no commit)",
          "npm run dev arranca sin errores",
      ],
      prompt="""Generá `.env.example` en la raíz del proyecto con todas las variables que el sistema necesita:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY (server-only, no exponer)
- RESEND_API_KEY
- RESEND_FROM
- NEXT_PUBLIC_WHATSAPP_NUMBER (con código país sin +)
- NEXT_PUBLIC_SITE_URL

Cada variable con un comentario breve. Verificá que `.gitignore` excluya `.env.local`. NO crees el `.env.local`."""),

    T("INFRA", "Setup Supabase CLI y estructura migraciones", "Sprint 0", "Highest", 1,
      objetivo="Tener supabase CLI funcionando con scripts npm para migraciones y types",
      alcance=[
          "supabase init",
          "supabase link --project-ref <ref>",
          "Crear supabase/migrations/ con .gitkeep",
          "Agregar scripts db:push, db:reset, db:types",
      ],
      criterios=[
          "supabase CLI vinculado",
          "npm run db:types regenera src/types/database.ts",
          "Carpeta supabase/migrations/ commiteada",
      ],
      prompt="""Inicializá Supabase CLI en el proyecto. Asumí que el dev ya corrió `supabase login` y tiene el project ref.

Pasos:
1. Correr `supabase init` (si no existe `supabase/`)
2. Crear `supabase/migrations/.gitkeep`
3. Agregar al `package.json` los scripts:
   - "db:push": "supabase db push"
   - "db:reset": "supabase db reset --linked"
   - "db:types": "supabase gen types typescript --linked > src/types/database.ts"
4. Crear `src/types/database.ts` con un placeholder vacío

NO corras `db:push` todavía."""),

    T("DEUDA", "Refactor: extraer mock-data a queries abstractas", "Sprint 0", "High", 2,
      contexto="Las pages consumen mock-data.ts directamente. Necesitamos abstraer en lib/queries/* para reemplazar implementación interna por Supabase sin tocar pages.",
      pasos=[
          "Crear src/lib/queries/posts.ts con getPublishedPosts, getPostBySlug, getDraftPosts, etc.",
          "Crear src/lib/queries/comments.ts, forums.ts, categories.ts, users.ts",
          "Reemplazar imports de @/lib/mock-data en TODAS las pages por las nuevas funciones",
          "Cada función retorna Promise (async) — internamente devuelve mock data por ahora",
      ],
      archivos=[
          "src/lib/queries/*.ts (nuevos)",
          "src/app/(public)/**/page.tsx",
          "src/app/admin/**/page.tsx",
      ],
      criterios=[
          "Pages no importan más de @/lib/mock-data",
          "npm run build pasa",
          "Cero regresiones visuales",
      ],
      prompt="""Refactorizá las pages para que no consuman `@/lib/mock-data` directamente. Creá `src/lib/queries/` con módulos que devuelven los mismos datos vía funciones async (Promise).

Crear:
- `src/lib/queries/posts.ts`: getPublishedPosts(), getPostBySlug(slug), getRelatedPosts(slug), getDraftPosts(), getScheduledPosts(), getAllPostsAdmin()
- `src/lib/queries/comments.ts`: getApprovedCommentsByPost(slug), getAllCommentsAdmin()
- `src/lib/queries/forums.ts`: getForumCategories(), getThreadsByCategory(slug), getThreadBySlug(category, slug), getRepliesByThread(threadId)
- `src/lib/queries/categories.ts`: getCategories(), getTags()
- `src/lib/queries/users.ts`: getAllUsersAdmin()

Reemplazá los imports en TODAS las pages (públicas y admin). Conservá el diseño exacto. Después corré `npm run build` y `npm run dev` para sanity check visual."""),

    T("DEUDA", "Centralizar statusMap y iconMap en lib/", "Sprint 0", "Medium", 1,
      contexto="3+ definiciones duplicadas de statusMap en pages admin. iconMap también local en /foros.",
      archivos=[
          "src/lib/status.ts (nuevo)",
          "src/app/admin/articulos/page.tsx",
          "src/app/admin/programados/page.tsx",
          "src/app/admin/comentarios/page.tsx",
          "src/app/(public)/foros/page.tsx",
      ],
      criterios=[
          "lib/status.ts exporta postStatusMap, commentStatusMap, caseStatusMap, forumIconMap",
          "Pages admin importan desde lib/status.ts",
          "Cero regresiones visuales",
      ],
      prompt="""Centralizar status maps e icon maps duplicados. Crear `src/lib/status.ts` con:

export const postStatusMap = {
  publicado: { label: "Publicado", className: "bg-green-50 text-green-700 border-green-200" },
  borrador: { label: "Borrador", className: "bg-gray-50 text-gray-600 border-gray-200" },
  programado: { label: "Programado", className: "bg-blue-50 text-blue-700 border-blue-200" },
};

export const commentStatusMap = {
  aprobado: { label: "Aprobado", className: "bg-green-50 text-green-700 border-green-200" },
  pendiente: { label: "Pendiente", className: "bg-orange-50 text-orange-600 border-orange-200" },
  rechazado: { label: "Rechazado", className: "bg-red-50 text-red-600 border-red-200" },
};

Y forumIconMap. Reemplazar las definiciones locales en pages admin y `app/(public)/foros/page.tsx`."""),

    T("DEUDA", "Mover mock data inline de /admin/usuarios a mock-data.ts", "Sprint 0", "Low", 1,
      prompt="""En `src/app/admin/usuarios/page.tsx` hay un `const mockUsers = [...]` declarado dentro del archivo. Movelo a `src/lib/mock-data.ts` como `mockUsers` exportado, junto con `roleConfig`. Importarlo desde la page. Cero cambios visuales."""),

    T("DEUDA", "Reemplazar componente X SVG inline por lucide", "Sprint 0", "Low", 1,
      prompt="""En `src/app/admin/categorias/page.tsx` hay un componente `X` definido al final del archivo como SVG inline. Reemplazarlo por `import { X } from "lucide-react"` y eliminar la función local. Verificar que las "X" de los tags se vean igual."""),

    T("INFRA", "Instalar dependencias backend y forms", "Sprint 0", "Highest", 1,
      prompt="""Instalá las dependencias:

npm i @supabase/supabase-js @supabase/ssr
npm i react-hook-form @hookform/resolvers zod
npm i sonner
npm i @tiptap/react @tiptap/starter-kit @tiptap/extension-link @tiptap/extension-image @tiptap/extension-placeholder
npm i isomorphic-dompurify
npm i resend

Verificá que `npm run build` siga pasando."""),

    T("INFRA", "Setup Toaster global con sonner", "Sprint 0", "High", 1,
      prompt="""Integrá `<Toaster />` de sonner globalmente.

1. En `src/app/layout.tsx` (root layout) importá `import { Toaster } from "sonner"`.
2. Agregalo dentro del body, después de {children}.
3. Configuralo: theme="light", position="top-right", richColors, closeButton.
4. Verificá que el build pase.

No uses ningún toast todavía."""),

    T("DEUDA", "Setup ESLint estricto + Prettier", "Sprint 0", "Low", 1,
      prompt="""Endurecé ESLint y agregá Prettier:

1. `npm i -D prettier eslint-config-prettier`
2. Crear `.prettierrc.json`: { "semi": true, "singleQuote": false, "trailingComma": "es5", "printWidth": 100, "tabWidth": 2 }
3. Crear `.prettierignore` con node_modules, .next, public
4. Actualizar eslint.config.mjs para extender "prettier"
5. Scripts package.json: "format", "format:check"
6. Correr `npm run format` una vez
7. Verificar que build y lint pasen"""),

    T("INFRA", "Crear cliente Supabase (browser, server, middleware)", "Sprint 0", "Highest", 2,
      objetivo="Wrappers de cliente para Next.js App Router siguiendo patrón @supabase/ssr",
      alcance=[
          "src/lib/supabase/client.ts (createBrowserClient)",
          "src/lib/supabase/server.ts (createServerClient con cookies de next/headers)",
          "src/lib/supabase/middleware.ts (helper para middleware.ts)",
          "middleware.ts en raíz src/ con matcher correcto",
      ],
      prompt="""Crear los wrappers Supabase para Next.js App Router con @supabase/ssr.

1. `src/lib/supabase/client.ts` — Client Components (createBrowserClient)
2. `src/lib/supabase/server.ts` — Server Components y Server Actions (createServerClient con cookies de next/headers)
3. `src/lib/supabase/middleware.ts` — utilidad para middleware
4. `src/middleware.ts` que invoque el helper para todas las rutas excepto _next/static, _next/image, favicon.ico, archivos estáticos
5. Tipar todo con `Database` desde `src/types/database.ts`

URLs y keys vienen de process.env. NO uses service role en estos clients (solo en Edge Functions y server actions específicas).

Verificá que el build pase."""),

    T("INFRA", "Crear error.tsx y not-found.tsx premium", "Sprint 0", "Medium", 1,
      prompt="""Crear páginas de error y 404 alineadas al diseño premium.

1. `src/app/not-found.tsx` — 404 con tipografía DM Serif grande, mensaje claro, botón "Volver al inicio". Centrado.
2. `src/app/error.tsx` (Client Component, props { error, reset }) — "Algo salió mal", botón "Reintentar".
3. `src/app/(public)/error.tsx` y `src/app/admin/error.tsx` específicos.

Estética sobria, spacing generoso, DM Serif para "404" y DM Sans para texto. Sin emojis."""),

    T("INFRA", "Estructura src/types/database.ts placeholder", "Sprint 0", "High", 1,
      prompt="""Crear `src/types/database.ts` con placeholder mínimo:

export type Database = {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};

Esto evita errores de tipos hasta que `supabase gen types` regenere."""),

    T("INFRA", "README técnico con setup y arquitectura", "Sprint 0", "Low", 1,
      prompt="""Actualizar `README.md` del proyecto con:
- Descripción
- Stack técnico
- Setup local (env, migrations, dev)
- Comandos disponibles (dev, build, lint, format, db:*)
- Estructura de carpetas alto nivel
- Link a docs/ para detalles

Tono profesional, breve, sin emojis."""),
]


# ============================================================================
# SPRINT 1 — AUTH (epic: AUTH + STORAGE)
# ============================================================================

S1 = [
    T("AUTH", "Migración 001: Extensions y enums", "Sprint 1", "Highest", 1,
      prompt="""Crear `supabase/migrations/20260501000001_init_extensions_enums.sql` con:
- create extension uuid-ossp, pg_trgm, pgcrypto
- enums: user_role, post_status, comment_status, case_status, case_priority, moderation_target, moderation_action

SQL exacto en docs/04-ARQUITECTURA-SUPABASE.md → Migration 001.

NO corras `supabase db push` todavía — esa decisión es del dev cuando esté listo."""),

    T("AUTH", "Migración 002: Profiles + trigger handle_new_user", "Sprint 1", "Highest", 1,
      prompt="""Crear `supabase/migrations/20260501000002_profiles.sql` con:
- tabla profiles (ver docs/04 → Migration 002)
- trigger handle_new_user en auth.users

Después correr `npm run db:push` y `npm run db:types` para regenerar `src/types/database.ts`."""),

    T("AUTH", "Migración 003: Categorías y tags + seeds", "Sprint 1", "Highest", 1,
      prompt="""Crear `supabase/migrations/20260501000003_categories_tags.sql` con tablas categories, tags, post_tags M:N + seed inicial según docs/04.

Aplicar y regenerar tipos."""),

    T("AUTH", "Migración 004: RLS policies profiles, categories, tags", "Sprint 1", "Highest", 1,
      prompt="""Crear `supabase/migrations/20260501000004_rls_profiles_taxonomy.sql` con:
- enable RLS en profiles, categories, tags, post_tags
- helper function `is_admin()` security definer
- policies para profiles (select público, update self, admin update all)
- policies para categorías y tags (select público, all admin)

Aplicar."""),

    T("AUTH", "Generar types DB y commitear", "Sprint 1", "High", 1,
      prompt="""Correr `npm run db:types` y commitear `src/types/database.ts`. Verificar que TypeScript no tenga errores con `npm run build`."""),

    T("AUTH", "Página /auth/login con server action", "Sprint 1", "Highest", 2,
      type="Story",
      objetivo="Usuario puede loguearse con email + password",
      alcance=[
          "Crear src/app/auth/layout.tsx standalone (sin Header/Footer público)",
          "src/app/auth/login/page.tsx con form premium",
          "Validación zod (email, password min 8)",
          "Server action signIn",
          "Estados: idle, submitting, error",
          "Toast éxito + redirect",
      ],
      criterios=[
          "Login funciona con cuentas reales",
          "Errores claros pero genéricos",
          "Redirect respeta ?redirectedFrom",
          "UI consistente con diseño premium",
      ],
      prompt="""Crear `src/app/auth/login/page.tsx` con form de login premium.

- Layout: `src/app/auth/layout.tsx` standalone sin Header/Footer del público
- Card centrado con logo arriba (mismo "V" del header)
- Campos: email, password
- Validación react-hook-form + zod (email, password min 8)
- Estados: idle, submitting (botón disabled + spinner), error (mensaje arriba con border rojo sutil)
- Link a /auth/registro y /auth/recuperar
- Server Action en `src/app/auth/login/actions.ts` que llama supabase.auth.signInWithPassword
- En éxito redirect a la URL anterior o "/" (default)
- Toast con sonner
- En error: mensaje genérico ("Email o contraseña incorrectos")

Diseño: aire, DM Serif para título "Iniciar sesión", inputs con foco premium, botón primary full-width."""),

    T("AUTH", "Página /auth/registro", "Sprint 1", "Highest", 2,
      type="Story",
      prompt="""Crear `src/app/auth/registro/page.tsx`. Mismo patrón que login.

Campos: display_name, email, password, password_confirm.
Validación zod: nombre 2-80, email, password 8+ con un número, match con confirmación.

Server Action `signUp` que llama supabase.auth.signUp con `data.options.data.display_name`. El trigger handle_new_user crea el profile automáticamente.

En éxito: toast "Te enviamos un email de confirmación" + redirect a /auth/login.

Manejo de errores: email ya registrado, password débil."""),

    T("AUTH", "Páginas /auth/recuperar y /auth/reset-password", "Sprint 1", "High", 1,
      type="Story",
      prompt="""Implementar flujo de recuperación de contraseña.

1. `src/app/auth/recuperar/page.tsx`: form con campo email. Server Action llama supabase.auth.resetPasswordForEmail con redirectTo a `${SITE_URL}/auth/reset-password`.
2. `src/app/auth/reset-password/page.tsx`: form con nueva contraseña + confirmación. Server Action llama supabase.auth.updateUser({ password }). Redirect a "/" con toast.

En Supabase Dashboard, configurar el email template "Reset password" para que apunte a la URL correcta."""),

    T("AUTH", "Middleware de auth con refresh y protección /admin", "Sprint 1", "Highest", 1,
      prompt="""Conectar middleware con Supabase para refresh automático de sesión.

`src/middleware.ts` y `src/lib/supabase/middleware.ts` ya existen. Implementar `updateSession(request)`:
- Crea Supabase server client con cookies de la request
- Llama supabase.auth.getUser() para refrescar
- Si la ruta empieza con "/admin" y el user no existe → redirect a /auth/login con `?redirectedFrom=<path>`
- Si la ruta empieza con "/admin" y el user no es admin → redirect a "/"

matcher en middleware.ts:
['/((?!_next/static|_next/image|favicon.ico|api/.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)']"""),

    T("AUTH", "Server actions auth (signIn, signUp, signOut, reset)", "Sprint 1", "Highest", 1,
      prompt="""Crear `src/app/auth/actions.ts` con server actions reutilizables:
- signIn(formData)
- signUp(formData)
- signOut()
- resetPassword(email)
- updatePassword(password)

Cada una valida con zod, llama Supabase, maneja errores, revalidatePath y redirige."""),

    T("AUTH", "Hook useUser() + UserProvider context", "Sprint 1", "High", 1,
      prompt="""Crear context de usuario para Client Components.

1. `src/lib/auth/UserProvider.tsx`: Client Component que recibe initial user y profile como props (server-fetched), expone via context.
2. Hook `useUser()` que retorna { user, profile, isAdmin, isLoading }.
3. Suscripción a `supabase.auth.onAuthStateChange` para actualizar el context.
4. Wrappear en root layout: server-fetch user con supabase.server() y pasar al provider.

No reemplaces el layout existente — agrego al árbol manteniendo el resto."""),

    T("AUTH", "Header reactivo a sesión (login/avatar/dropdown)", "Sprint 1", "High", 1,
      type="Story",
      prompt="""Conectar `src/components/layout/header.tsx` con context de usuario.

Cambios:
- Si NO hay user: en lugar de "Panel", mostrar "Ingresar" → /auth/login
- Si HAY user: avatar (iniciales o foto) con dropdown de shadcn que tenga "Mi perfil" → /perfil, "Panel admin" (solo si isAdmin) → /admin, "Cerrar sesión"
- Mobile menu: misma lógica adaptada

Mantener motion underline y todo el diseño actual."""),

    T("AUTH", "Proteger /admin con AdminGuard server-side", "Sprint 1", "Highest", 1,
      prompt="""Defense-in-depth para `/admin`. El middleware ya cubre el caso, pero agregar AdminGuard server-side.

1. Crear `src/app/admin/AdminGuard.tsx` Server Component:
   - supabase server client + getUser()
   - Si no existe → redirect a /auth/login
   - Consulta profiles para verificar role='admin' — si no, redirect a "/"
2. En `src/app/admin/layout.tsx` envolver children en AdminGuard."""),

    T("AUTH", "Conectar /perfil real (lectura + actualización)", "Sprint 1", "High", 1.5,
      type="Story",
      prompt="""Convertir `/perfil` en Server + Client mixto.

Server Component wrapper:
- Obtiene profile del user logueado
- Pasa a Client Component con form

Client Component:
- react-hook-form con display_name, bio, avatar_url
- Validación zod
- Server Action updateProfile(formData) actualiza profiles
- Toast éxito
- Stats reales (count comments, count threads)

Reemplazar datos hardcoded de "Laura Giménez" por reales."""),

    T("STORAGE", "Bucket avatars + ImageUploader para perfil", "Sprint 1", "Medium", 1.5,
      prompt="""Crear bucket `avatars` y componente reutilizable.

1. Migración `supabase/migrations/20260501000005_storage_avatars.sql`:
   - insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true)
   - policies avatars_insert_self, avatars_update_self, avatars_select_public, avatars_delete_self

2. Crear `src/components/shared/ImageUploader.tsx` Client Component:
   - Props: bucket, path callback, onUpload(url), maxSizeMB, accept
   - Drop/click selector
   - Validación size + format
   - supabase.storage.from(bucket).upload con upsert true
   - Loading + preview + delete
   - Reutilizable (post-images en Sprint 2)

3. En `/perfil` agregar ImageUploader que sube a avatars/{user_id}/, getPublicUrl, guarda en profiles.avatar_url. Optimistic preview."""),

    T("AUTH", "Conectar /admin/usuarios con queries reales", "Sprint 1", "Medium", 1,
      type="Story",
      prompt="""Reemplazar mockUsers en `/admin/usuarios` por queries Supabase a profiles + auth.users.

Server Component que lista profiles con joins a auth.users (email, last_sign_in_at).

Mantener UI exacta. Filtros por rol via query param + server filter.

Loading con skeleton, empty con `<EmptyState />`."""),

    T("AUTH", "Acción admin: cambiar rol de usuario", "Sprint 1", "Medium", 1,
      prompt="""En `/admin/usuarios`, agregar opción en el menú "..." de cada fila para "Cambiar a admin" / "Cambiar a usuario".

Server Action que UPDATE profiles.role.

Confirmar con AlertDialog (shadcn). Toast post-acción. Revalidate.

Validar (UI + server) que un admin no pueda quitarse el rol a sí mismo."""),

    T("AUTH", "Validators zod compartidos para auth", "Sprint 1", "Medium", 1,
      prompt="""Crear `src/lib/validators/auth.ts` con schemas zod reutilizables:
- loginSchema (email, password min 8)
- signupSchema (display_name, email, password, password_confirm con refine match)
- resetEmailSchema
- updatePasswordSchema

Importar desde pages auth en lugar de duplicar."""),
]


# ============================================================================
# SPRINT 2 — BLOG BACKEND (epic: BLOG + STORAGE)
# ============================================================================

S2 = [
    T("BLOG", "Migración 005: Posts + indices + tsvector", "Sprint 2", "Highest", 1,
      prompt="""Crear `supabase/migrations/20260601000001_posts.sql` con tabla posts completa según docs/04 → Migration 004 (search_vector generated, indices GIN, post_tags M:N).

Aplicar y regenerar types."""),

    T("BLOG", "RLS policies posts y post_tags", "Sprint 2", "Highest", 1,
      prompt="""Crear `supabase/migrations/20260601000002_rls_posts.sql`:
- enable RLS posts, post_tags
- policy posts_select_published (público + admin)
- policy posts_admin_all (admin only, all)
- policy post_tags_select_with_post
- policy post_tags_admin_all

Aplicar y regenerar tipos."""),

    T("STORAGE", "Bucket post-images con policies", "Sprint 2", "Highest", 1,
      prompt="""Crear `supabase/migrations/20260601000003_storage_post_images.sql`:
- crear bucket post-images público
- policies: insert/update/delete solo admin (usar is_admin()), select público

Aplicar."""),

    T("BLOG", "Componente RichTextEditor con TipTap", "Sprint 2", "Highest", 3,
      type="Story",
      contexto="El editor actual es un textarea — necesitamos editor visual real.",
      prompt="""Reemplazar el textarea actual de `/admin/articulos/nuevo` por editor TipTap real.

1. Crear `src/components/editor/RichTextEditor.tsx` Client Component:
   - TipTap con extensions: StarterKit, Link, Image, Placeholder
   - Toolbar: heading 2/3, bold, italic, bullet/ordered list, blockquote, link (con dialog), image (abre ImageUploader), undo/redo
   - Estilo: barra superior border-b, área de edición con padding y prose
   - Output: JSON (TipTap) y HTML
   - Props: value (JSON), onChange (JSON, html)

2. Crear `src/lib/editor/sanitize.ts`:
   - sanitizeHtml(html: string): string usando isomorphic-dompurify
   - whitelist tags: h2, h3, p, ul, ol, li, blockquote, strong, em, a (href, rel), img (src, alt), br, hr"""),

    T("BLOG", "Sanitización server-side antes de persistir HTML", "Sprint 2", "Highest", 1,
      prompt="""En la server action que persiste un post, antes de guardar el HTML aplicar `sanitizeHtml()` con DOMPurify.

Configurar whitelist exacta para nuestro editor: h2, h3, p, ul, ol, li, blockquote, strong, em, a (href, rel=noopener noreferrer auto-añadido), img (src, alt), br, hr.

Esto protege contra XSS si el editor envía algo malicioso. Test unitario con payloads XSS clásicos."""),

    T("BLOG", "CategorySelect server-driven", "Sprint 2", "Medium", 1,
      prompt="""Crear `src/components/admin/CategorySelect.tsx`:
- Server Component que lee categories desde Supabase
- Renderiza <Select> de shadcn con opciones
- Props: name, defaultValue, required

Usar en `/admin/articulos/nuevo` y `/admin/articulos/[id]`."""),

    T("BLOG", "TagSelector multi-select con creación inline", "Sprint 2", "Medium", 1.5,
      prompt="""Crear `src/components/admin/TagSelector.tsx` Client Component:
- Multi-select usando cmdk (shadcn Command)
- Búsqueda en vivo
- Si la query no matchea: opción "Crear etiqueta: [query]" → server action createTag
- Tags seleccionados como chips removibles
- Props: defaultTags, onChange(tagIds[])

Conectar a posts via post_tags M:N en la action de save."""),

    T("BLOG", "/admin/articulos real con filtros y búsqueda", "Sprint 2", "Highest", 2,
      type="Story",
      prompt="""Convertir `/admin/articulos` en Server Component conectado.

- getAllPostsAdmin() con filtros opcionales por status, category, search
- Filtros desde URL (?status=draft&category=impuestos&q=reforma)
- Mantener tabla actual
- Acciones (icons) conectadas:
  - Eye → href a /blog/{slug} si publicado, sino preview
  - Pencil → href a /admin/articulos/{id}
  - Trash → AlertDialog → server action deletePost (soft delete)

Loading state con skeleton de tabla."""),

    T("BLOG", "/admin/articulos/nuevo editor real conectado", "Sprint 2", "Highest", 3,
      type="Story",
      prompt="""Conectar el editor con persistencia.

1. Server action `createPost(formData)` en `src/app/admin/articulos/actions.ts`:
   - Validación zod (titulo min 5, content no vacío, status válido)
   - Generar slug único (slugify + check conflict en DB)
   - Sanitizar content_html
   - Calcular read_time_minutes (~250 wpm)
   - INSERT post + post_tags
   - Si scheduled validar scheduled_for futuro
   - Si published setear published_at = now()
   - Subir imagen destacada si viene
   - revalidatePath /blog y /admin/articulos
   - Redirect con toast

2. Page `nuevo` Server + Client mixto:
   - Form con react-hook-form
   - Editor TipTap, ImageUploader, CategorySelect, TagSelector, status radio, scheduled_for date
   - Botones "Guardar borrador" y "Publicar" llaman action con status

Mantener diseño exacto."""),

    T("BLOG", "/admin/articulos/[id] editar artículo", "Sprint 2", "Highest", 1.5,
      type="Story",
      prompt="""Crear `src/app/admin/articulos/[id]/page.tsx`.

Server Component lee post por ID. Pasa a Client form. Action updatePost(id, formData) similar a createPost pero UPDATE.

Reusar componentes (RichTextEditor con value inicial, ImageUploader con imagen actual).

Botones: "Guardar cambios", "Despublicar" (status = draft), "Eliminar" (soft delete con confirm)."""),

    T("BLOG", "Soft delete posts", "Sprint 2", "Medium", 1,
      prompt="""Server action deletePost(id):
- UPDATE posts SET deleted_at = now() WHERE id = $1
- Revalidate /admin/articulos y /blog
- Toast

NO hard delete. Los registros con deleted_at no aparecen por RLS o filtro en queries."""),

    T("BLOG", "Auto-cálculo read_time y slug único", "Sprint 2", "Medium", 1,
      prompt="""Crear `src/lib/utils/text.ts`:
- slugify(title): string (lowercase, accents removed, spaces → -)
- ensureUniqueSlug(supabase, slug): agrega -2, -3 si existe
- estimateReadTime(html): minutos basados en ~250 wpm sobre plain text del HTML

Usar en createPost y updatePost. Test unitario con casos edge."""),

    T("BLOG", "/admin/programados real con datos", "Sprint 2", "Medium", 1,
      type="Story",
      prompt="""Convertir `/admin/programados` en Server Component.

Dos secciones:
- Programados: status='scheduled' y scheduled_for futuro
- Borradores: status='draft'

Acciones rápidas:
- Editar → /admin/articulos/{id}
- Eliminar → soft delete con confirm
- "Publicar ahora" en programados → status=published, published_at=now(), scheduled_for=null

Mantener UI."""),

    T("BLOG", "Función publish_scheduled_posts + cron", "Sprint 2", "High", 1,
      prompt="""Crear `supabase/migrations/20260601000010_scheduled_publish.sql`:
- create extension pg_cron (verificar que el plan lo soporte)
- function publish_scheduled_posts() UPDATE posts→published cuando scheduled_for <= now()
- cron.schedule cada 5 min

Aplicar.

Si pg_cron NO está disponible en plan Free: alternativa con Vercel Cron en `/api/cron/publish` que llama Edge Function con header de seguridad."""),

    T("BLOG", "/blog real con paginación, filtros, búsqueda", "Sprint 2", "Highest", 2,
      type="Story",
      prompt="""Convertir `/blog` en Server Component conectado.

Search params: ?page=1, ?cat=impuestos, ?tag=iva, ?q=reforma

Query Supabase:
- Paginación 10/página
- Filtros por category_id, post_tags.tag_id
- Búsqueda full-text: WHERE search_vector @@ plainto_tsquery('spanish', $q)

Sidebar dinámica:
- Categorías con count real
- Tags populares (top 10)
- Artículos recientes (últimos 4)

SearchBar conecta con form que actualiza ?q=. Pagination conecta con ?page=. Mantener UI."""),

    T("BLOG", "/blog/[slug] real con SEO + view tracking", "Sprint 2", "Highest", 1.5,
      type="Story",
      prompt="""Convertir `/blog/[slug]` en Server Component.

- getPostBySlug(slug) — si no existe → notFound()
- Render content_html dentro de prose-premium
- Sidebar conectada
- generateMetadata(post) para SEO (title, description, og:image)
- Increment view_count vía Edge Function track-post-view en Client Component aparte (fire-and-forget)

Form de comentarios queda hasta Sprint 3 (no funcional aún, pero conectar lectura de aprobados)."""),

    T("BLOG", "Edge Function track-post-view con dedupe", "Sprint 2", "Low", 1,
      prompt="""Crear Edge Function `supabase/functions/track-post-view/index.ts`:
- POST con { post_slug }
- Hash IP + user-agent → ip_hash
- Si no hay otra view del mismo ip_hash en últimas 24h → INSERT en post_views + UPDATE posts.view_count
- Devuelve 200

En `/blog/[slug]` llamar desde Client Component con useEffect (fire-and-forget)."""),

    T("BLOG", "/admin/categorias CRUD real", "Sprint 2", "Medium", 2,
      type="Story",
      prompt="""Convertir `/admin/categorias` en CRUD real para categories y tags.

Server Component lee categorías y tags. Client para forms.

Actions:
- createCategory({ name, description, slug })
- updateCategory(id, ...)
- deleteCategory(id) — verificar dependencias (posts asociados)
- createTag({ name, slug })
- deleteTag(id)

Validaciones zod: name 2-50, slug auto-generado desde name.

Manejar caso eliminar cat con posts → warning + opción "mover posts a otra cat"."""),

    T("BLOG", "SEO básico blog (metadata + JSON-LD)", "Sprint 2", "High", 1,
      prompt="""SEO en blog:

1. `/blog/page.tsx`: export const metadata estática
2. `/blog/[slug]/page.tsx`: generateMetadata({ params }):
   - title: post.title
   - description: post.excerpt
   - openGraph: { title, description, images, type: 'article', publishedTime, authors }
   - twitter: { card: 'summary_large_image' }
3. JSON-LD Article schema en script tag (BlogPosting con headline, datePublished, author, image)"""),

    T("BLOG", "Sitemap.xml y robots.txt", "Sprint 2", "Medium", 1,
      prompt="""Crear `src/app/sitemap.ts` (App Router convention):
- URLs estáticas (/, /sobre-nosotros, /blog, /foros, /contacto)
- Posts publicados con lastModified=updated_at, priority 0.8
- Categorías y forum categories

Crear `src/app/robots.ts` permitiendo todo + sitemap reference."""),

    T("BLOG", "accent_color por artículo (UI + DB)", "Sprint 2", "Medium", 1,
      prompt="""Implementar variación de color por artículo (requerimiento del cliente).

1. Migración: ALTER TABLE posts ADD COLUMN accent_color text. Default null.
2. Migración: ALTER TABLE categories ADD COLUMN accent_color text default '#d97706'.
3. En `/admin/articulos/nuevo` y `[id]` agregar color picker simple (5-6 presets: ámbar, verde, azul, rojo, violeta, slate). Si no se elige, hereda de categoría.
4. En render `/blog/[slug]`: aplicar el color como CSS variable que tinta el badge de categoría, blockquote border, sutil tinte en hero del artículo.

Subtle, no chillón. Coherente con diseño premium."""),
]


# ============================================================================
# SPRINT 3 — COMMENTS + FORUMS (epic: COMMENTS + FORUM)
# ============================================================================

S3 = [
    T("COMMENTS", "Migración 006: Comments", "Sprint 3", "Highest", 1,
      prompt="""Crear `supabase/migrations/20260701000001_comments.sql` con tabla comments según docs/04 → Migration 005. Aplicar y regenerar tipos."""),

    T("COMMENTS", "RLS policies comments", "Sprint 3", "Highest", 1,
      prompt="""Crear `supabase/migrations/20260701000002_rls_comments.sql` con policies:
- comments_select_approved (público approved + admin all + self own)
- comments_insert_anyone (auth con author_id self, o anon con email + name)
- comments_admin_modify
- comments_admin_delete

Aplicar."""),

    T("COMMENTS", "CommentForm con honeypot + rate-limit", "Sprint 3", "High", 2,
      type="Story",
      prompt="""Crear `src/components/blog/CommentForm.tsx` Client Component.

- Si user logueado: form con solo content. author_id = user.id.
- Si NO logueado: form con name, email, content.
- Honeypot: input hidden aria-hidden=true llamado "website" — si se llena, descartar.
- Rate-limit: localStorage timestamp último envío < 60s → no permitir.
- Server action createComment:
  - validación zod (content 2-2000 chars)
  - rate limit server-side por IP (consulta últimos 60s misma IP)
  - sanitización content
  - INSERT con status='pending'
  - Trigger Edge Function notificación
  - return success/error
- En éxito: toast "Tu comentario está pendiente de aprobación"."""),

    T("COMMENTS", "CommentItem con replies anidadas (1 nivel)", "Sprint 3", "Medium", 1,
      prompt="""Crear `src/components/blog/CommentItem.tsx`.

Props: comment con replies array. Si user es admin, botón "Responder" abre mini-form.

Layout:
- Avatar (iniciales si no hay)
- Nombre + fecha
- Content
- Replies: línea vertical guía + indentadas

Reusar styles del prototipo."""),

    T("COMMENTS", "Conectar comentarios en /blog/[slug]", "Sprint 3", "Highest", 1.5,
      type="Story",
      prompt="""Reemplazar lista hardcoded en `/blog/[slug]` por:
1. getApprovedCommentsByPost(slug) — solo aprobados, ordenados por fecha asc, con replies anidadas (1 nivel)
2. Render con `<CommentItem />`
3. `<CommentForm />` al final
4. Mostrar count real"""),

    T("COMMENTS", "/admin/comentarios real con filtros", "Sprint 3", "Highest", 1.5,
      type="Story",
      prompt="""Convertir `/admin/comentarios` en Server Component con datos reales.

Filtros: ?status=pending|approved|rejected, ?q=, ?post=

Mantener UI. Botones aprobar/rechazar/eliminar conectan a server actions."""),

    T("COMMENTS", "Acciones moderación con moderation_logs", "Sprint 3", "Highest", 1,
      prompt="""Server actions:
- approveComment(id, reason?)
- rejectComment(id, reason?)
- deleteComment(id, reason?) (soft)

Cada una:
1. Verifica is_admin
2. UPDATE comment status (o soft delete)
3. INSERT moderation_logs
4. Si approve: trigger Edge Function send-comment-approved
5. revalidatePath /blog/[slug] y /admin/comentarios
6. toast

Optimistic UI con useOptimistic en client."""),

    T("COMMENTS", "Admin responde comentario", "Sprint 3", "High", 1,
      prompt="""En `/admin/comentarios` y `/blog/[slug]` (modo admin), agregar acción "Responder" en cada comentario.

Crea comment con parent_id = comment.id, author_id = admin.id, status='approved' automático.

UI: botón "Responder" abre dialog con textarea, validación, submit."""),

    T("COMMENTS", "Edge Function send-comment-notification (admin)", "Sprint 3", "Medium", 1,
      prompt="""Crear `supabase/functions/send-comment-notification/index.ts`:
- Triggered desde DB trigger AFTER INSERT comments con status=pending
- Recibe { comment_id, post_slug, author_name, content_excerpt }
- Llama Resend API con template HTML
- Email al admin (env RESEND_NOTIFY_EMAIL)
- Subject: "Nuevo comentario pendiente de moderación"

Trigger DB en migración: AFTER INSERT comments → call edge function via pg_net o Supabase webhook."""),

    T("COMMENTS", "Edge Function send-comment-approved (autor)", "Sprint 3", "Low", 1,
      prompt="""Edge Function que envía email al autor cuando su comentario es aprobado.

Trigger: en server action approveComment después del UPDATE. Llamar function con { comment_id, recipient_email }.

Template: "Tu comentario en [post title] fue aprobado. Verlo en [URL]"."""),

    T("FORUM", "Migración 007: Forums + indices + tsvector", "Sprint 3", "Highest", 1,
      prompt="""Crear `supabase/migrations/20260701000010_forums.sql` con forum_categories, forum_threads, forum_replies + indices + tsvector según docs/04 → Migration 006. Seeds de forum_categories.

Aplicar y regenerar tipos."""),

    T("FORUM", "RLS policies forums", "Sprint 3", "Highest", 1,
      prompt="""Crear `supabase/migrations/20260701000011_rls_forums.sql` con policies según docs/04 sección RLS forums.

Aplicar."""),

    T("FORUM", "Trigger reply count y last_reply", "Sprint 3", "Medium", 1,
      prompt="""Crear `supabase/migrations/20260701000012_trigger_replies.sql` con función update_thread_reply_stats y trigger en forum_replies según docs/04 → Migration 010."""),

    T("FORUM", "/foros real con categorías + actividad", "Sprint 3", "Highest", 1,
      type="Story",
      prompt="""Convertir `/foros` en Server Component:
- Lista forum_categories con threadCount, replyCount, lastActivity calculados
- Sección "Actividad reciente": últimos 4 threads ordenados por last_reply_at desc

Mantener UI exacta."""),

    T("FORUM", "/foros/[category] real con paginación + búsqueda", "Sprint 3", "Highest", 1.5,
      type="Story",
      prompt="""Convertir `/foros/[category]` en Server Component.

Search params: ?page, ?q. Threads pinned arriba, luego ordenados por last_reply_at desc.

Botón "Nuevo hilo" abre Sheet con NewThreadForm."""),

    T("FORUM", "/foros/[category]/[thread] real con replies", "Sprint 3", "Highest", 1.5,
      type="Story",
      prompt="""Convertir detalle hilo en Server Component:
- Thread + replies ordenados asc
- ReplyForm al final si user logueado y thread no locked
- Increment view_count via Edge Function

Mantener UI."""),

    T("FORUM", "NewThreadForm component", "Sprint 3", "High", 1.5,
      prompt="""Componente Client en Sheet (shadcn) con:
- title (5-200 chars)
- content (10+ chars)
- category preselected si vino del path

Server action createThread:
- validation zod
- INSERT
- generar slug único en (category_id, slug)
- redirect al thread nuevo
- toast

Solo accesible si user logueado, sino redirect a /auth/login."""),

    T("FORUM", "ReplyForm component", "Sprint 3", "High", 1,
      prompt="""Textarea + botón Publicar. Server action createReply(thread_id, content).

Validación: min 2, max 5000. Rate limit 30s. Anti-spam básico.

UI: aparece al final del thread si user logueado y thread no locked. Sino mensaje "Iniciá sesión" o "Hilo cerrado"."""),

    T("FORUM", "/admin/foros real con CRUD categorías y moderación", "Sprint 3", "Medium", 2,
      type="Story",
      prompt="""Convertir admin foros:
- CRUD forum_categories (igual que blog categorías)
- Lista de hilos recientes con acciones de moderación

Mantener UI."""),

    T("FORUM", "Acciones admin foros (pin/lock/hide/delete)", "Sprint 3", "Medium", 1,
      prompt="""Server actions con moderation_logs:
- pinThread(id) / unpinThread(id)
- lockThread(id) / unlockThread(id)
- hideThread(id) / unhideThread(id)
- deleteThread(id) (soft)
- deleteReply(id) (soft)

Cada una loguea en moderation_logs."""),

    T("FORUM", "Búsqueda full-text en foros", "Sprint 3", "Medium", 1,
      prompt="""Conectar SearchBar en /foros y /foros/[category] con search_vector @@ plainto_tsquery.

Resultados con highlight (ts_headline opcional). Paginación."""),

    T("FORUM", "Anti-spam threads y replies", "Sprint 3", "Medium", 1,
      prompt="""En createThread y createReply:
- Rate limit por user_id: max 5 posts/hora, max 3 threads/día
- Detección básica spam: regex URLs sospechosas, % mayúsculas, repetición
- Si flag spam: insert con flag o status hidden, log para revisión

Honeypot en forms."""),
]


# ============================================================================
# SPRINT 4 — CASES + DASHBOARD (epic: CASES + DASH)
# ============================================================================

S4 = [
    T("CASES", "Migración 008: Cases + case_messages", "Sprint 4", "Highest", 1,
      prompt="""Crear `supabase/migrations/20260801000001_cases.sql` con cases y case_messages según docs/04 → Migration 007. Incluye sequence case_code_seq.

Aplicar."""),

    T("CASES", "RLS policies cases y case_messages", "Sprint 4", "Highest", 1,
      prompt="""RLS según docs/04: cases insert público, select admin, update admin. case_messages all admin.

Aplicar."""),

    T("CASES", "/contacto crea caso real", "Sprint 4", "Highest", 1.5,
      type="Story",
      prompt="""Convertir form de `/contacto` en funcional. Server action createCase(formData):
- Validación zod (name, email, subject, message; phone opcional)
- INSERT con status=new, priority=medium
- Trigger Edge Function send-case-notification
- Devolver el code generado al cliente
- Mostrar pantalla de éxito con código + texto "Te enviamos un email con tu código de seguimiento"

Mantener UI del form actual exacta."""),

    T("CASES", "/seguimiento consulta por código + email", "Sprint 4", "High", 1.5,
      type="Story",
      prompt="""Crear `src/app/(public)/seguimiento/page.tsx`:
- Form con campos: código, email
- Server action o llamada a Edge Function `case-public-status`
- Si match: mostrar estado, prioridad, fecha, último mensaje visible (no internal)
- Si no match: mensaje genérico "No encontramos un caso con esos datos"

Diseño premium consistente."""),

    T("CASES", "Edge Function case-public-status", "Sprint 4", "High", 1,
      prompt="""Edge Function `supabase/functions/case-public-status/index.ts` que valida code + email matchean y devuelve datos del caso (sin notas internas).

Rate limit por IP para evitar enumeración."""),

    T("CASES", "/admin/casos listado con filtros", "Sprint 4", "High", 1.5,
      type="Story",
      prompt="""Crear `src/app/admin/casos/page.tsx`:
- Listado con filtros (status, prioridad, asignado, búsqueda)
- Tabla con columnas: code, name, subject (truncated), status, priority, assigned, created_at
- Acciones rápidas en cada fila

Estilo coherente con /admin/articulos."""),

    T("CASES", "/admin/casos/[id] detalle + mensajes + notas", "Sprint 4", "High", 2,
      type="Story",
      prompt="""Crear `src/app/admin/casos/[id]/page.tsx`:
- Header: código, nombre, status badge, prioridad
- Datos de contacto
- Mensaje original
- Timeline de case_messages (separar internal de public visualmente)
- Form para agregar nuevo mensaje (toggle internal/visible)
- Sidebar: cambiar status, prioridad, asignar, notas internas"""),

    T("CASES", "Server actions de casos", "Sprint 4", "High", 1,
      prompt="""Server actions:
- updateCaseStatus(id, status, message?)
- updateCasePriority(id, priority)
- assignCase(id, profile_id)
- addCaseMessage(id, message, is_internal)

Cada cambio de status (no internal) envía email al cliente vía Edge Function."""),

    T("CASES", "Edge Functions case email (notification + status update)", "Sprint 4", "High", 1,
      prompt="""Crear:
- `supabase/functions/send-case-notification/index.ts`: en INSERT cases envía 2 emails — admin + cliente con código
- `supabase/functions/send-case-status-update/index.ts`: en UPDATE cases.status envía email al cliente

Templates HTML simples con branding. Disparados por DB triggers o server actions."""),

    T("DASH", "Migración 009: Post views + moderation_logs", "Sprint 4", "High", 1,
      prompt="""Crear `supabase/migrations/20260801000010_views_modlogs.sql` con post_views y moderation_logs según docs/04 → Migration 008.

Aplicar."""),

    T("DASH", "/admin dashboard con métricas reales", "Sprint 4", "Highest", 2,
      type="Story",
      prompt="""Reemplazar dashboardStats hardcoded por queries reales:
- count posts publicados, borradores, programados
- count comments pendientes
- count threads activos
- count profiles
- sum post_views del mes + cálculo trend vs mes anterior
- count cases abiertos

Cards conectadas. Top 5 posts por view_count.

Comentarios pendientes (sección): query real.
Últimos posts: query real."""),

    T("DASH", "Chart visitas últimos 30 días", "Sprint 4", "Medium", 1,
      prompt="""Componente `<ViewsChart />` en /admin con line chart de visitas últimos 30 días.

Usar recharts o shadcn/charts. Datos agregados por día desde post_views.

Diseño minimalista, color principal del admin."""),

    T("DASH", "Card top 5 artículos más leídos", "Sprint 4", "Low", 1,
      prompt="""Card "Más leídos" en dashboard con top 5 posts por view_count en los últimos 30 días."""),

    T("DASH", "Card casos abiertos en dashboard", "Sprint 4", "Medium", 1,
      prompt="""Card en dashboard con count de cases con status NOT IN ('resolved', 'closed') + lista de los 3 más recientes con priority alta."""),
]


# ============================================================================
# SPRINT 5 — VISUAL UX (epic: VISUAL)
# ============================================================================

S5 = [
    T("VISUAL", "WhatsAppButton floating + inline", "Sprint 5", "High", 1,
      prompt="""Crear `src/components/shared/WhatsAppButton.tsx`:
- Variante "floating": fixed bottom-right, círculo verde con icono WhatsApp, hover sutil
- Variante "inline": botón inline para CTAs
- Props: variant, message? (texto pre-rellenado), label?
- Genera href: `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`

Insertar variante floating en `(public)/layout.tsx` salvo en /admin."""),

    T("VISUAL", "WhatsApp en formularios y CTAs", "Sprint 5", "High", 1,
      prompt="""Insertar `<WhatsAppButton variant="inline" />` en:
- /contacto (junto al submit)
- /sobre-nosotros (en CTA)
- footer (junto a "Email")

Mensajes pre-rellenados según contexto (ej. "Hola, quiero hacer una consulta sobre [tema]")."""),

    T("VISUAL", "HeroCarousel con transición Framer Motion", "Sprint 5", "High", 2,
      prompt="""Crear `src/components/home/HeroCarousel.tsx` Client Component:
- Recibe array de slides ({ image, headline, subheadline, cta })
- Auto-rotate cada 6 segundos con fade transition (Framer Motion AnimatePresence)
- Pause on hover
- Dots de navegación abajo
- Responsive con next/image
- Mantener tipografía y diseño del hero actual"""),

    T("VISUAL", "Tabla home_slides + admin CRUD básico", "Sprint 5", "Medium", 1,
      prompt="""Crear migración tabla `home_slides`:
- id, headline, subheadline, image_url, cta_text, cta_href, display_order, is_active, created_at, updated_at

RLS: select público, all admin.

Admin CRUD básico en `/admin/home` (página simple para gestionar slides).

Conectar HeroCarousel con queryHomeSlides() server-side."""),

    T("VISUAL", "Home: menos texto + más visuales", "Sprint 5", "High", 2,
      type="Story",
      contexto="Cliente pidió en reunión: 'menos texto, más fotos, gráficos, íconos'",
      prompt="""Aplicar feedback del cliente: reducir bloques de texto, agregar más iconografía y espacio visual.

Cambios sugeridos en `src/app/(public)/page.tsx`:
- Hero: ya con carousel
- Stats: reducir texto y agregar iconos sutiles
- Servicios: alternar iconos lucide con micro-ilustraciones (sutiles, monocromas)
- CTA: más limpio
- Considerar sección "Trabajamos con" con logos placeholder

Mantener identidad premium. Sin emojis. No exagerar."""),

    T("VISUAL", "Página /servicios/[slug] template", "Sprint 5", "High", 2,
      type="Story",
      prompt="""Crear `src/app/(public)/servicios/[slug]/page.tsx` Server Component:
- Hero con título del servicio + imagen
- Descripción detallada (rich content)
- Lista de sub-servicios o features
- CTA: contacto + WhatsApp inline
- Sidebar con artículos del blog relacionados (filter por tag/categoría)

Diseño consistente con /sobre-nosotros pero enfocado en un servicio específico."""),

    T("VISUAL", "Migración services + seeds", "Sprint 5", "High", 1,
      prompt="""Migración tabla services:
- id, slug, name, description, hero_image, content (jsonb), display_order, is_active, related_category, accent_color, seo_title, seo_description, created_at, updated_at

RLS: select is_active público, all admin.

Seeds con 1-3 servicios placeholder."""),

    T("VISUAL", "/admin/servicios CRUD", "Sprint 5", "High", 2,
      type="Story",
      prompt="""Crear `/admin/servicios` con CRUD igual que blog:
- Listado
- Editor (TipTap para content) + ImageUploader para hero
- Crear/editar/eliminar

Consistente con admin/articulos."""),

    T("VISUAL", "Editor: insertar imagen desde Storage existente", "Sprint 5", "Medium", 1,
      prompt="""En el TipTap editor, el botón "Insertar imagen" debe:
1. Abrir un dialog
2. Subir nueva imagen (con ImageUploader) o seleccionar de existentes en bucket post-images
3. Insertar tag <img> con la URL pública

Browse de imágenes existentes: query del bucket con signed URL para preview."""),

    T("VISUAL", "Página /buscar global (blog + foros + servicios)", "Sprint 5", "Medium", 1,
      type="Story",
      prompt="""Crear `/buscar` global con resultados de blog + foros + servicios.

Server Component lee ?q=. Tres tabs: Artículos | Foros | Servicios.

Las barras de búsqueda del header redirigen a /buscar?q=."""),

    T("VISUAL", "Open Graph dinámico para artículos", "Sprint 5", "Medium", 1,
      prompt="""Crear `src/app/blog/[slug]/opengraph-image.tsx` (App Router OG image generation con next/og).

Genera imagen 1200x630 con título del post, autor, fecha y branding. Estilo editorial: fondo claro, DM Serif para título, slate para textos."""),
]


# ============================================================================
# SPRINT 6 — QA & PRODUCTION (epic: QA)
# ============================================================================

S6 = [
    T("QA", "Suite Vitest unit (slug, sanitize, validators)", "Sprint 6", "High", 1,
      prompt="""Setup Vitest + Testing Library. Tests unitarios para:
- src/lib/utils/text.ts (slugify, ensureUniqueSlug, estimateReadTime)
- src/lib/editor/sanitize.ts (sanitizeHtml con casos XSS)
- validators auth/post/comment

Configurar `npm test` y `npm test:watch`."""),

    T("QA", "Suite Playwright E2E flujo crítico", "Sprint 6", "High", 2,
      prompt="""Setup Playwright. Test E2E del flujo crítico:
1. Visitor crea cuenta
2. Confirma email (mock o auto-confirm en test env)
3. Comenta en un post
4. Admin se loguea
5. Admin aprueba comentario
6. Visitante (sin login) ve el comentario

Correr en CI."""),

    T("QA", "Auditoría RLS automatizada", "Sprint 6", "Highest", 2,
      prompt="""Crear script `scripts/audit-rls.ts`:
1. Crear cuenta test no-admin
2. Intentar SELECT/INSERT/UPDATE/DELETE en cada tabla
3. Reportar qué pudo y qué no
4. Verificar que NO pueda leer borradores, casos, mod_logs, etc.
5. Falla si encuentra brechas

Correr en CI o pre-deploy."""),

    T("QA", "Auditoría XSS en editor", "Sprint 6", "Highest", 1,
      prompt="""Test que inserta payload XSS clásico (script, onerror, javascript:, data:, etc.) en el editor TipTap y verifica que el HTML persistido NO contiene esos vectores.

Usar sanitizeHtml directamente en unit tests + E2E con browser."""),

    T("QA", "Auditoría rate-limit endpoints", "Sprint 6", "Medium", 1,
      prompt="""Script que envía 100 requests al endpoint createComment desde la misma IP en 60s. Verifica que solo los primeros pasen y el resto retorne error.

Mismo para createCase, createReply, createThread."""),

    T("QA", "Optimización imágenes + Lighthouse target ≥90", "Sprint 6", "High", 2,
      prompt="""Audit:
- Verificar que todas las imágenes en pages usen next/image
- Configurar `images.formats: ['image/avif', 'image/webp']` en next.config
- Configurar Storage transformaciones de Supabase para resize
- Lazy loading default
- Correr Lighthouse CI en home y blog
- Target: ≥90 perf, ≥95 a11y, ≥100 SEO

Si no llega: optimizar bundle, lazy load components below fold."""),

    T("QA", "Setup Resend + dominio verificado", "Sprint 6", "High", 1,
      prompt="""Configurar Resend:
1. Crear cuenta o usar existente del cliente
2. Verificar dominio del cliente (DNS DKIM/SPF)
3. Crear template HTML con branding
4. Set RESEND_API_KEY y RESEND_FROM en Vercel env vars
5. Test de envío"""),

    T("QA", "Deploy Vercel + env vars + dominio", "Sprint 6", "Highest", 2,
      type="Story",
      prompt="""Deploy a producción:
1. Conectar repo a Vercel
2. Importar proyecto desde GitHub
3. Set env vars (todos los NEXT_PUBLIC_*, SUPABASE_SERVICE_ROLE_KEY, RESEND_*, NEXT_PUBLIC_WHATSAPP_NUMBER, NEXT_PUBLIC_SITE_URL)
4. Configurar Preview deployments para PRs
5. Deploy a producción
6. Configurar dominio del cliente. SSL automático.
7. Redirect www o root según preferencia"""),

    T("QA", "Habilitar Supabase backups (PITR)", "Sprint 6", "Medium", 0.5,
      prompt="""Habilitar Point-in-Time Recovery en Supabase (requiere plan Pro). Documentar política de backups.

Si plan Free: scheduled SQL dump diario a S3 vía Edge Function."""),

    T("QA", "Vercel Analytics + Speed Insights", "Sprint 6", "Low", 0.5,
      prompt="""Habilitar @vercel/analytics y @vercel/speed-insights en root layout.

Verificar reporte en dashboard Vercel."""),

    T("QA", "Runbook de incidentes (docs/RUNBOOK.md)", "Sprint 6", "Medium", 1,
      prompt="""Crear `docs/RUNBOOK.md` con procedimientos paso a paso para:
- Site caído → Vercel status, Supabase status, logs
- Email no llega → Resend logs, dominio
- Comentarios no se publican → trigger DB, RLS
- Cron no corre → pg_cron logs o Vercel cron
- Storage roto → permisos, quotas

Cada uno con pasos accionables."""),

    T("QA", "Página de mantenimiento estática", "Sprint 6", "Low", 0.5,
      prompt="""Crear `public/maintenance.html` estática para activar manualmente cuando haya rollouts. Estética premium consistente con el resto."""),

    T("QA", "Smoke tests post-deploy", "Sprint 6", "Medium", 1,
      prompt="""GitHub Action que después de deploy a producción ejecuta smoke tests:
- /  → 200
- /blog → 200
- /api/health → 200 (crear endpoint simple)
- DB connection check

Si falla: alerta y rollback automático sugerido."""),

    T("QA", "Capacitación cliente: video + manual + sesión", "Sprint 6", "High", 2,
      prompt="""Preparar capacitación:
1. Screen-recording del panel admin (15-20 min): login, crear artículo, programar, moderar comentarios, gestionar casos
2. Mini-manual PDF con screenshots y pasos clave
3. Sesión live 1h con cliente Q&A"""),

    T("QA", "Plan de rollback documentado", "Sprint 6", "Medium", 0.5,
      prompt="""Crear `docs/ROLLBACK.md`:
- Deploy: Vercel previous deployment con un clic
- Migración DB: down migration o restore point
- Edge Function: redeploy versión anterior

Cada caso con pasos ejecutables."""),

    T("QA", "GitHub Actions CI (lint, build, test)", "Sprint 6", "Medium", 1,
      prompt="""Crear `.github/workflows/ci.yml`:
- Triggered on PR
- Node 20
- npm ci, npm run lint, npm run build, npm test

Crear `.github/workflows/deploy.yml`:
- On push a main
- Deploy via Vercel CLI

Status checks obligatorios para mergear."""),
]


ALL_TASKS = S0 + S1 + S2 + S3 + S4 + S5 + S6

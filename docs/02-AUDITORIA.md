# Auditoría del Estado Actual

## Estructura del proyecto

```
src/
├── app/
│   ├── (public)/                    ← Layout público con Header/Footer
│   │   ├── page.tsx                 ← Home
│   │   ├── sobre-nosotros/page.tsx
│   │   ├── blog/
│   │   │   ├── page.tsx             ← Listing
│   │   │   └── [slug]/page.tsx      ← Detalle
│   │   ├── foros/
│   │   │   ├── page.tsx             ← Categorías + actividad
│   │   │   ├── [category]/page.tsx  ← Listado de hilos
│   │   │   └── [category]/[thread]/page.tsx ← Hilo
│   │   ├── contacto/page.tsx
│   │   └── perfil/page.tsx
│   ├── admin/                       ← Layout admin con sidebar
│   │   ├── page.tsx                 ← Dashboard
│   │   ├── articulos/
│   │   │   ├── page.tsx             ← Listado
│   │   │   └── nuevo/page.tsx       ← Editor (crear)
│   │   ├── programados/page.tsx
│   │   ├── comentarios/page.tsx
│   │   ├── categorias/page.tsx
│   │   ├── foros/page.tsx
│   │   └── usuarios/page.tsx
│   ├── globals.css
│   └── layout.tsx                   ← Root
├── components/
│   ├── layout/      ← Header, Footer
│   ├── blog/        ← ArticleCard
│   ├── shared/      ← Breadcrumbs, Pagination, SearchBar, EmptyState, SectionHeader, PostImage
│   └── ui/          ← shadcn (badge, button, dialog, etc.)
└── lib/
    ├── mock-data.ts ← Toda la data de demo (autores, posts, comments, foros, threads)
    └── utils.ts     ← cn() de shadcn
```

## Inventario de pantallas

### Públicas (9 rutas, todas visuales)

| Ruta | Estado funcional | Lo que es solo visual |
|---|---|---|
| `/` Home | Estática | OK estática (landing). Falta hero carousel. |
| `/sobre-nosotros` | Estática | OK estática. Cliente pidió poder tener páginas adicionales por servicio. |
| `/blog` | Solo visual | Search input no busca, paginación falsa, categorías no filtran, tags no filtran. |
| `/blog/[slug]` | Solo visual | Comentarios mock, formulario no envía, sidebar no funcional. |
| `/foros` | Solo visual | Categorías no enlazan a contenido real, búsqueda visual. |
| `/foros/[category]` | Solo visual | Hilos hardcoded, paginación falsa, búsqueda visual, botón "nuevo hilo" sin acción. |
| `/foros/[cat]/[hilo]` | Solo visual | Replies hardcoded, formulario no envía, "útil"/"reportar" sin acción. |
| `/contacto` | Solo visual | Formulario no envía. Falta WhatsApp button. Falta botón email-action. Sin captcha. |
| `/perfil` | Solo visual | No hay auth real, datos hardcoded, "guardar cambios" no persiste. |

### Admin (8 rutas, todas visuales)

| Ruta | Estado | Acciones que NO funcionan |
|---|---|---|
| `/admin` | Solo visual | Stats hardcoded, sin auth real, accesible a cualquiera. |
| `/admin/articulos` | Solo visual | Filtros no filtran, búsqueda visual, acciones (ver/editar/eliminar) sin lógica. |
| `/admin/articulos/nuevo` | Solo visual | Editor no es rich-text real (textarea), upload imagen no funciona, status/categoría/tags no persisten. **Falta ruta `/admin/articulos/[id]` para editar.** |
| `/admin/programados` | Solo visual | Listado mock, acciones no funcionan. |
| `/admin/comentarios` | Solo visual | Filtros visuales, aprobar/rechazar/eliminar sin lógica. |
| `/admin/categorias` | Solo visual | CRUD no funciona, no persiste. |
| `/admin/foros` | Solo visual | Toda la moderación es visual (pin/lock/eliminar). |
| `/admin/usuarios` | Solo visual | Lista hardcoded, sin acciones (cambio rol, suspender, etc.). |

## Componentes globales actuales

### Reutilizables OK
- `Header` (con menú hamburguesa mobile y motion underline) — buen estado
- `Footer` — buen estado
- `Breadcrumbs`, `Pagination`, `SearchBar`, `EmptyState`, `SectionHeader` — buen estado
- `ArticleCard` — buen estado
- `PostImage` (next/image con fallback gradiente) — buen estado

### Faltantes (a crear)
- `<RichTextEditor />` (TipTap)
- `<ImageUploader />` (Storage)
- `<CategorySelect />` (server-driven)
- `<TagSelector />` (multi-select con creación inline)
- `<DatePicker />` (para programación)
- `<AuthForm />` (login/signup compartido)
- `<UserAvatar />` (con fallback a iniciales)
- `<RoleGuard />` (HOC/wrapper para proteger rutas/secciones)
- `<HeroCarousel />` (slider con transición)
- `<CommentItem />` con replies anidadas
- `<ThreadReplyForm />`
- `<CaseStatusBadge />`
- `<NotificationToast />` (sonner)
- `<WhatsAppButton />` floating + inline en forms

## Flujos incompletos detectados

| Flujo | Estado | Faltante |
|---|---|---|
| Registro | NO existe | Página `/auth/registro`, integración Supabase Auth |
| Login | NO existe | Página `/auth/login`, OAuth opcional |
| Recuperar contraseña | NO existe | Página `/auth/recuperar`, flujo email |
| Verificación de email | NO existe | Confirmación post-registro |
| Crear comentario en blog | Visual | Validación, anti-spam, persistencia, notificación a admin |
| Moderar comentario | Visual | Aprobar/rechazar/eliminar persistente |
| Responder comentario | NO existe | Estructura de threading (1 nivel) |
| Crear hilo de foro | Visual | Form modal/route, persistencia |
| Responder hilo | Visual | Persistencia, notificaciones |
| Buscar artículos | Visual | Full-text search en Supabase |
| Filtrar por categoría/tag | Visual | Query params + server filter |
| Crear artículo | Visual | Editor real, upload imagen, persistir, publicar/programar |
| Programar publicación | Visual | Edge Function + pg_cron |
| Subir imagen destacada | Visual | Bucket Supabase Storage + signed URLs |
| Editar perfil | Visual | Persistir nombre, avatar, descripción |
| Contacto → caso | NO existe | Crear caso con estado, asignación a admin |
| Seguimiento de caso | NO existe | Vista pública de estado por código o login |

## Inconsistencias detectadas

1. **Ruta de editar artículo no existe.** Solo existe `/admin/articulos/nuevo` pero no `/admin/articulos/[id]`. Los iconos de "editar" en la tabla no llevan a ningún lado.
2. **Mock data inline en componentes admin.** `/admin/usuarios/page.tsx` tiene un `const mockUsers = [...]` declarado dentro del archivo en lugar de venir de `mock-data.ts`.
3. **Duplicación de iconMap.** `/foros/page.tsx` define `iconMap` localmente. Si se reusa, debe estar en `lib/`.
4. **Componente X local en `/admin/categorias/page.tsx`.** Se definió un componente `X` SVG dentro del archivo en lugar de usar `lucide-react`. Es un parche.
5. **Status badge styling repetido.** `/admin/articulos/page.tsx`, `/admin/programados/page.tsx`, `/admin/comentarios/page.tsx` tienen sus propios `statusMap` — debería centralizarse.
6. **Tipos de Post no incluyen ID.** `Post` en `mock-data.ts` solo usa `slug` como identificador. Para Supabase necesitamos `id: uuid` separado.
7. **`commentCount` mockeado.** No se calcula a partir de comentarios reales.
8. **No hay ruta de búsqueda dedicada.** Las barras de búsqueda no llevan a `/buscar` o similar.
9. **Falta página 404 customizada** alineada con el diseño premium.
10. **Falta página de error genérica** (`error.tsx`).
11. **Layouts:** `/admin/layout.tsx` no protege contra usuarios no admin.
12. **Mobile menu del admin** existe pero no muestra el rol/email del usuario, ni botón logout.

## Estados UX faltantes

| Estado | Donde falta |
|---|---|
| Loading (skeleton) | Todas las listas (articulos, comments, threads, users) |
| Error | Todas las páginas con fetch |
| Empty state real | Existe el componente pero no se usa cuando data=0 |
| Success (toast) | No hay sistema de toasts (sonner) instalado |
| Form errors | Inputs no muestran errores de validación |
| Optimistic UI | Acciones de moderación deberían ser optimistas |

## Validaciones faltantes

- Email format en formularios de comentario, contacto, registro
- Longitud mínima/máxima en título de artículo, comentarios, posts de foro
- URL válida en links insertados en editor
- Tamaño/formato de imagen en upload
- Rate limit en POST de comentarios y respuestas
- Honeypot en formularios públicos
- CSRF protection (Next.js lo cubre con Server Actions, pero hay que verificar)

## Deuda técnica actual

| Item | Severidad | Acción |
|---|---|---|
| Mock data inline en admin/usuarios | Baja | Mover a `mock-data.ts` (corto plazo) |
| Componente X SVG inline en categorias | Baja | Reemplazar por `<X />` de lucide |
| Duplicación de statusMap | Media | Crear `lib/status.ts` con mappings centralizados |
| `Post.slug` como ID en mock | Media | Refactor a `{ id, slug }` antes de conectar Supabase |
| Sin sistema de toasts | Alta | Instalar sonner antes de Sprint 1 |
| Sin react-hook-form ni zod | Alta | Instalar antes de Sprint 1 |
| Sin Supabase client wrapper | Alta | Crear en Sprint 1 |
| Sin tipado de DB | Alta | Usar `supabase gen types` desde Sprint 1 |
| Sin tests | Media | Añadir Vitest + Playwright en Sprint 6 |
| Sin CI/CD | Media | GitHub Actions en Sprint 6 |
| Sin lint/format estricto | Baja | Añadir prettier + ajustar eslint |

## Inputs adicionales del cliente (de la transcripción del 21/abr)

Aspectos que el prototipo NO contempla y vienen de la reunión:

1. **Seguimiento de casos** — Cliente pidió sección dedicada. Federico lo abordó vía contacto + gestión interna. **Ambigüedad pendiente:** ¿es portal con login para el cliente, o solo seguimiento interno por parte del admin?

2. **Botón WhatsApp** — Obligatorio en todos los formularios. Floating button global + inline en CTAs.

3. **Email link** — Como alternativa de contacto en formularios.

4. **Páginas adicionales por servicio** — "Sobre el estudio" tiene UN servicio principal con sub-servicios, pero el cliente pidió que cada servicio (ej. "consultas tributarias") tenga su propia página landing. Estructura escalable: `/servicios/[slug]`.

5. **Hero con carousel** — Imágenes que rotan con efecto de transición. Hoy es estático.

6. **Color variable por blog** — Cada artículo del blog debería tener variación visual (color de acento, tinte de hero, badge). Hoy son uniformes.

7. **Menos texto, más visuales en landing** — Pulir Home con más ilustraciones/iconografía/imágenes y reducir bloques de texto.

8. **Más técnico en blog/foros** — Mantener densidad textual editorial donde corresponde.

9. **Comentarios responder** — Cada comentario aprobado debería poder ser respondido por el admin (1 nivel de threading). Hoy comentarios son lista plana.

## Dependencias técnicas a sumar

Antes de Sprint 1:
```bash
npm i @supabase/supabase-js @supabase/ssr
npm i react-hook-form @hookform/resolvers zod
npm i sonner          # toasts
npm i @tiptap/react @tiptap/starter-kit @tiptap/extension-link @tiptap/extension-image
npm i isomorphic-dompurify
npm i resend
```

Para Sprint 6:
```bash
npm i -D vitest @testing-library/react @testing-library/jest-dom playwright
npm i -D prettier
```

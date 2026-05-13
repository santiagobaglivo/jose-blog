# Multi-marca / multi-dominio — guía de implementación y setup

> Estado: implementación inicial completada en código. Pendiente: aplicar migrations en Supabase y smoke test E2E. Lectura asociada: `09-DELTAS-POST-MEET.md`.

## Decisiones cerradas

1. **Las 8 marcas tienen su propio dominio** (Lectura A confirmada con Federico).
2. **Sin sitio madre**: cada marca es 100 % independiente, no hay dominio raíz que liste a todas.
3. **Un post pertenece a una sola marca** (relación 1-N, no N-N).
4. **Layout común + color de acento por marca**: mismo template, cambia el `accent_color`.
5. **Comunidad independiente por marca**: cada marca tiene sus propios usuarios, comentarios y foros (ver §3 sobre auth cross-domain).
6. **Admin global en MVP**: 1 admin ve y gestiona todas las marcas.
7. **Dominios sin comprar todavía**: el código está listo, falta DNS.

## 1. Cambios a la base de datos

Cinco migrations nuevas (`supabase/migrations/`):

| Archivo | Qué hace |
| --- | --- |
| `20260801000001_brand_domain.sql` | Suma `domain text unique` a `brands` (NULL hasta que se compre). |
| `20260801000002_brand_id_taxonomy.sql` | Suma `brand_id NOT NULL` a `categories` y `tags`. **Borra los seeds argentinos** (Monotributo, AFIP, etc.) — el admin carga categorías reales por marca. Slug deja de ser globalmente único: dos marcas pueden tener "tributario". |
| `20260801000003_brand_id_posts.sql` | Suma `brand_id NOT NULL` a `posts`. Slug deja de ser globalmente único. |
| `20260801000004_brand_id_profiles.sql` | Suma `brand_id NULLABLE` a `profiles` (NULL = admin global, valor = usuario de esa marca). Trigger `handle_new_user` actualizado para tomar `brand_id` desde `raw_user_meta_data` del signup. |
| `20260801000005_rls_multi_brand.sql` | Reescribe RLS de `posts`, `categories`, `tags` para esconder data de marcas inactivas/eliminadas. |

### Aplicación

```bash
# Una vez que esté Supabase linkeado:
npm run db:push
npm run db:types   # regenera src/types/database.ts
```

Sin `db:types`, **TypeScript no compila** (el tipo `Database` no conoce las columnas nuevas).

## 2. Routing por host

Dos archivos nuevos + un archivo modificado:

- `src/lib/brand-domains.ts` — caché in-memory (TTL 5 min) con lookup `host → brand`. Lee desde Supabase con `service_role`. Refresh atómico (sin races) y soporte para invalidar (la usa el admin tras cada cambio en `brands`).
- `src/lib/auth/brand-context.ts` — `getBrandContext()` y `requireBrandContext()` para Server Components / Server Actions. Lee headers `x-brand-id`, `x-brand-slug`, `x-brand-name`, `x-brand-accent` que setea el proxy.
- `src/lib/supabase/middleware.ts` — extendido. Resuelve brand desde host antes de auth, setea headers, y al final hace `NextResponse.rewrite` para reescribir `escudotributario.pe/blog` → ruta interna `/escudo-tributario/blog` (que matchea `(brand)/[brand]/blog/page.tsx`). Paths globales (`/admin`, `/auth`, `/api`, `/_next`) no se rewritean.

### Estructura de rutas resultante

```
src/app/
├── (brand)/[brand]/        # rutas públicas por marca
│   ├── page.tsx            # home de la marca (era marcas/[slug]/page.tsx)
│   ├── layout.tsx          # aplica accent_color como CSS var
│   ├── blog/...
│   ├── foros/...
│   ├── perfil/...
│   ├── contacto/...
│   └── sobre-nosotros/...
├── admin/                  # panel — vive en dominio neutral
├── auth/                   # login/registro — global
└── page.tsx                # root (sin host de marca): muestra lista de marcas y links dev
```

Las páginas heredadas (`blog`, `foros`, `perfil`, etc.) **se movieron** desde `(public)/` pero **todavía no filtran por brand_id** en sus queries — eso es trabajo de los sprints donde se conectan a real data (Sprint 2-4 según el plan original).

## 3. Auth con dominios separados — limitación conocida

Las cookies de sesión de Supabase son **por dominio**. Eso significa:

- Un usuario que se loggea en `escudotributario.pe` no está loggeado en `tributafacil.pe`.
- Esto **es coherente** con la decisión de "comunidad independiente por marca".
- En la práctica: cada marca tiene su propia base de usuarios (separados por `profiles.brand_id`).

El admin vive en un dominio neutral (ej. `admin.estudiojl.pe` o lo que se decida) y no comparte cookies con los dominios públicos. Eso está bien — el admin no necesita conocer al "usuario regular" de una marca, solo a los `admin` globales.

## 4. Cambios en el admin

- `AdminShell` ahora tiene entry "Marcas" en el sidebar.
- `admin/marcas/brand-form.tsx` tiene un campo nuevo "Dominio público" (opcional). El form valida formato (sin `http://`, sin `/`).
- `admin/marcas/actions.ts` invalida la caché de host→brand en cada cambio (alta, edición, soft delete, toggle).
- `admin/marcas/page.tsx` muestra el dominio en la tabla y el botón "Ver pública" abre `https://<domain>/` si está seteado, o `/<slug>` como fallback.
- `admin/articulos/actions.ts` `createTag` ahora requiere `brandId` (necesario porque `tags.brand_id` es NOT NULL). El editor de posts tendrá que pasar la marca actual.

## 5. Setup local para development

Como ningún dominio real está comprado, hay dos formas de probar localmente:

### Opción A — Acceso por path (rápido)

`http://localhost:3000/escudo-tributario` muestra la home de Escudo Tributario porque el layout resuelve el brand desde `params` cuando no hay header. Útil para iterar UI sin tocar `/etc/hosts`.

### Opción B — Hosts simulados (testing del proxy real)

```bash
# /etc/hosts
127.0.0.1 escudotributario.local
127.0.0.1 tributafacil.local
127.0.0.1 derecholaboral360.local
# ... etc
```

Después en el admin de marcas, asignar a cada marca su dominio `.local`:

- Escudo Tributario → `escudotributario.local`
- Tributa Fácil → `tributafacil.local`
- ...

Con eso `http://escudotributario.local:3000/` activa el rewrite real del proxy y muestra la marca correcta.

> **Nota dev:** la caché del proxy es de 5 min. Si cambiás el `domain` en el admin, se invalida automáticamente. Si modificaste algo desde el SQL editor de Supabase, esperá 5 min o reiniciá el dev server.

## 6. Pasos para arrancar

1. Crear proyecto Supabase y guardar `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` en `.env.local`.
2. `supabase link --project-ref <ref>`.
3. `npm run db:push` (aplica las 11 migrations en orden, incluyendo el seed de las 8 marcas).
4. `npm run db:types` (regenera `src/types/database.ts`; sin esto TypeScript no compila).
5. Crear un usuario admin desde el SQL editor de Supabase:
   ```sql
   update public.profiles set role = 'admin' where id = '<auth_user_id>';
   ```
6. `npm run dev`, ir a `/admin`, loggearse, entrar en "Marcas" y asignar los dominios `.local` para testing local (ver §5).

## 7. Bugs encontrados en revisión y corregidos

Pasada de revisión post-implementación encontró estos bugs que ya fueron arreglados:

| Bug | Archivo | Fix |
| --- | --- | --- |
| Rewrite a path inexistente `/_brand/<slug>` | `src/lib/supabase/middleware.ts` | Cambiar a `/<slug>${pathname}` que matchea `(brand)/[brand]/...`. Sumar idempotencia para no doble-rewrite. |
| Header con "Velázquez & Asociados" hardcoded | `src/components/layout/header.tsx` | Recibe `brand` como prop desde el layout. Logo y nombre dinámicos. |
| Footer con "Velázquez & Asociados" + áreas argentinas | `src/components/layout/footer.tsx` | Recibe `brand` como prop. Quita las "áreas" hardcoded (Impuestos/Contabilidad/etc.) que apuntaban a categorías borradas. Copyright dinámico. |
| `signUp` no asocia user a la marca actual | `src/app/auth/actions.ts` | Lee `x-brand-id` del header (seteado por proxy) y lo pasa a `raw_user_meta_data` para que el trigger lo capture. |
| Páginas auth (login/registro/recuperar/reset) con título "Velázquez" hardcoded | `src/app/auth/*/page.tsx` | `generateMetadata` async + brand context. Logo dinámico con accent color. |
| `sobre-nosotros` con texto institucional argentino + bios + timeline ficticios | `src/app/(brand)/[brand]/sobre-nosotros/page.tsx` | Hero usa `brand.name` + `brand.about_text`. Se sacaron timeline y bios ficticias (placeholders del prototipo, no contenido real). |
| Title del root layout con "Velázquez" | `src/app/layout.tsx` | Title genérico. Cada brand page genera su propio metadata. |
| AdminShell con "V" + "Panel Editorial" + "MV / Martín Velázquez" | `src/app/admin/AdminShell.tsx` | Usa `useUser()` para nombre + iniciales reales del admin loggeado. Logo neutral. |
| Editor de artículos con "MV / Martín Velázquez" | `src/app/admin/articulos/nuevo/page.tsx` | Lee user actual del server, muestra nombre + iniciales reales. |

## 8. Lo que queda pendiente

### Adaptaciones de schema/data

- **Queries heredadas que filtren por `brand_id`**: `getPublishedPosts`, `getPostBySlug`, queries de comments/forums/etc. Hoy usan mock data; cuando se conecten a real data deben filtrar por brand.
- **Editor de artículos**: hoy `admin/articulos/nuevo` es UI-only sin server action `createPost`. Cuando se sume, debe pedir marca (selector) y pasar `brand_id` al insert.
- **`createTag` desde editor**: ya recibe `brandId` como parámetro requerido, pero el componente que lo invoca debe pasarlo (el editor todavía no está conectado).

### Posibles ampliaciones

- **Logo propio por marca**: hoy se usa la inicial del nombre + accent_color. Si José quiere logos reales, sumar `logo_url` a `brands` y reemplazar el `<span>{initial}` en Header/Footer.
- **WhatsApp por marca**: `whatsapp-cta.tsx` lee `NEXT_PUBLIC_WHATSAPP_NUMBER` global. Cada marca debería tener su propio número — sumar `whatsapp_number` a `brands`.
- **Equipo profesional por marca**: hoy `getTeamMembers()` es mock. Cuando se cargue equipo real, debe filtrar por marca (sumar `brand_id` o tabla `brand_team`).
- **Timeline e historia por marca**: la decisión fue sacar el placeholder argentino. Si José provee historia real por marca, sumar a la página o a la tabla `brands` (campo `history_text`).

### Smoke test E2E (F7)

Bloqueado hasta que se complete el setup de Supabase. Pasos para probar:

1. Aplicar migrations + regenerar types.
2. Promocionar un user a admin desde el SQL editor.
3. `/etc/hosts` con dominios `.local` apuntando a 127.0.0.1.
4. Ir al admin → Marcas → asignar `domain` a cada marca.
5. Visitar cada `<dominio>.local:3000/` y verificar que muestre la marca correcta.
6. Probar registro desde un dominio de marca → verificar que `profiles.brand_id` quede seteado.
7. Probar `/admin` desde dominio neutral → verificar que el panel funcione y vea todas las marcas.

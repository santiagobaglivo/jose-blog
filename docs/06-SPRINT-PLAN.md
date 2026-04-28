# Plan de Sprints

> Cada sprint dura 1 semana de trabajo focalizado para 1 dev senior. Capacidad: 30-35h efectivas/sprint.
> Foco en cierre de epics: cada sprint debe dejar el sistema en estado utilizable.

---

## Sprint 0 — Auditoría y preparación técnica

**Duración estimada:** 3-5 días
**Objetivo:** Sentar bases de infra y refactor mínimo del proyecto para enchufar Supabase sin romper el prototipo.

**Tareas incluidas:**

- JB-001 Configurar proyecto Supabase (cuentas, env, secretos)
- JB-002 Setup Supabase CLI + estructura `supabase/migrations`
- JB-003 Refactor: extraer mock-data a `src/lib/queries/` con interfaces que reemplazaremos por Supabase queries
- JB-004 Centralizar `statusMap` + `iconMap` en `lib/`
- JB-005 Mover mock data inline de `/admin/usuarios` a `mock-data.ts`
- JB-006 Quitar componente `X` SVG inline en `/admin/categorias` (usar lucide)
- JB-007 Instalar dependencias (zod, react-hook-form, sonner, supabase-js, ssr, tiptap, dompurify)
- JB-008 Setup `<Toaster />` global con sonner
- JB-009 Setup ESLint stricto + Prettier
- JB-010 Crear `.env.example` con todas las variables documentadas
- JB-011 Crear cliente Supabase: `lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/supabase/middleware.ts`
- JB-012 Crear `error.tsx` y `not-found.tsx` premium
- JB-013 Estructura `src/types/` con `database.ts` placeholder
- JB-014 Documentar arquitectura en `README.md` técnico

**Entregable:**

- Proyecto Supabase conectable
- Prototipo refactorizado con queries abstractas listas para reemplazar
- CI lint pasa
- Toasts funcionando globalmente

**Criterio de finalización:**

- `npm run build` y `npm run lint` ✅
- Cliente Supabase exportado y funcional (test conexión)
- Cero regresiones visuales en el prototipo

---

## Sprint 1 — Backend base y autenticación

**Duración estimada:** 5-7 días
**Objetivo:** Migraciones base + auth funcional. Cualquier persona puede registrarse y loguearse. Admin protegido.

**Tareas incluidas:**

- JB-101 Migración 001 Extensions & enums
- JB-102 Migración 002 Profiles + trigger handle_new_user
- JB-103 Migración 003 Categories & tags + seeds
- JB-104 RLS policies para profiles y categorías
- JB-105 Generar types DB con `supabase gen types`
- JB-106 Crear `/auth/login` (email + password)
- JB-107 Crear `/auth/registro`
- JB-108 Crear `/auth/recuperar` y flujo de reset
- JB-109 Middleware `middleware.ts` para refresh de sesión
- JB-110 Server action `signIn`, `signUp`, `signOut`, `resetPassword`
- JB-111 Hook `useUser()` y context provider
- JB-112 Conectar `<Header />` con estado de auth (Login / Avatar dropdown)
- JB-113 Proteger layout `/admin/*` (redirect si no admin)
- JB-114 Conectar `/perfil` real (lectura + actualización)
- JB-115 Upload de avatar a bucket `avatars`
- JB-116 Conectar `/admin/usuarios` (lectura real)
- JB-117 Acción admin: cambiar rol de usuario
- JB-118 Validaciones zod de auth forms

**Entregable:**

- Sistema de auth completo
- Profile auto-creado al registrarse
- Header reactivo a sesión
- `/admin` protegido
- Perfil editable con avatar real

**Criterio de finalización:**

- Hilos de QA: registrar → recibir verificación → loguear → editar perfil → ver admin (si admin) → logout
- RLS testeado con cuenta no-admin: no ve datos sensibles
- Lighthouse ≥ 90 en pages auth

---

## Sprint 2 — Blog backend (CRUD + editor + Storage + búsqueda + scheduling)

**Duración estimada:** 8-10 días
**Objetivo:** Blog 100% funcional de punta a punta — admin crea, edita, programa, publica; público lee, busca, filtra.

**Tareas incluidas:**

- JB-201 Migración 004 Posts + post_tags + indices
- JB-202 RLS policies posts
- JB-203 Migración Storage bucket `post-images` + policies
- JB-204 Componente `<RichTextEditor />` con TipTap (heading, bold, italic, lista, link, imagen, blockquote)
- JB-205 Sanitizado server-side con DOMPurify antes de persistir
- JB-206 Componente `<ImageUploader />` para Storage
- JB-207 Componente `<CategorySelect />` (server-driven)
- JB-208 Componente `<TagSelector />` multi-select con creación inline
- JB-209 Página `/admin/articulos` listado real con filtros (status, categoría, búsqueda)
- JB-210 Página `/admin/articulos/nuevo` editor real conectado
- JB-211 Página `/admin/articulos/[id]` editar
- JB-212 Acción "publicar inmediatamente" / "guardar borrador" / "programar"
- JB-213 Acción "eliminar" (soft delete)
- JB-214 Auto-cálculo de `read_time_minutes` y `slug` server-side
- JB-215 Página `/admin/programados` real
- JB-216 Migración 011 + función `publish_scheduled_posts` + cron job
- JB-217 Página `/blog` real (paginación, filtros por cat/tag, búsqueda)
- JB-218 Página `/blog/[slug]` real (lectura, sidebar dinámica)
- JB-219 Tracking de view_count (Edge Function `track-post-view`)
- JB-220 Migración 003 + admin CRUD categorías y tags
- JB-221 Página `/admin/categorias` real (CRUD)
- JB-222 SEO básico en `/blog` y `/blog/[slug]` (metadata, OG)
- JB-223 Sitemap.xml de artículos
- JB-224 Soporte de `accent_color` por artículo (variación visual)

**Entregable:**

- Admin gestiona el blog completamente desde la UI
- Público accede a blog dinámico, busca y filtra
- Programación automática funcionando
- Imágenes en Storage

**Criterio de finalización:**

- Crear artículo desde admin → publicar → verlo en `/blog` → buscar → filtrar
- Programar artículo a 5 min en el futuro → confirmar publicación automática
- RLS verificado: usuario no-admin no puede ver borradores

---

## Sprint 3 — Comentarios + Foros

**Duración estimada:** 7-10 días
**Objetivo:** Interacción comunitaria activa. Comentarios con moderación. Foros completos.

**Tareas incluidas:**

- JB-301 Migración 005 Comments
- JB-302 RLS comments
- JB-303 Componente `<CommentForm />` con honeypot + rate-limit
- JB-304 Componente `<CommentItem />` con replies (1 nivel)
- JB-305 Conectar comentarios en `/blog/[slug]` (form + lectura)
- JB-306 Página `/admin/comentarios` real con filtros (estado, búsqueda)
- JB-307 Acción aprobar / rechazar / eliminar comentario (con `moderation_logs`)
- JB-308 Acción admin: responder comentario
- JB-309 Edge Function `send-comment-notification` (email a admin)
- JB-310 Edge Function `send-comment-approved` (email al autor)
- JB-311 Migración 006 Forums + indices + tsvector
- JB-312 RLS forums
- JB-313 Migración 010 Trigger reply count
- JB-314 Página `/foros` real (categorías + actividad reciente)
- JB-315 Página `/foros/[category]` real con paginación + búsqueda
- JB-316 Página `/foros/[category]/[thread]` real con replies
- JB-317 Componente `<NewThreadForm />` (modal o page)
- JB-318 Componente `<ReplyForm />`
- JB-319 Página `/admin/foros` real (gestión categorías + acciones moderación)
- JB-320 Acciones admin foros: pin, lock, hide, delete (con `moderation_logs`)
- JB-321 Búsqueda full-text en foros
- JB-322 Anti-spam básico en hilos y replies (rate-limit + min-chars)

**Entregable:**

- Comentarios funcionando con moderación
- Foros operativos con threads y replies
- Anti-spam básico activo
- Notificaciones email funcionando

**Criterio de finalización:**

- Visitante puede dejar comentario → admin recibe email → modera → comentario aparece en sitio
- Usuario logueado puede crear hilo → otros usuarios responden → admin puede moderar
- RLS testeado: contenido oculto/borrado no visible para no-admin

---

## Sprint 4 — Sistema de casos + Dashboard real + Métricas

**Duración estimada:** 5-7 días
**Objetivo:** Contacto se transforma en caso con código de seguimiento. Dashboard refleja estado real.

**Tareas incluidas:**

- JB-401 Migración 007 Cases + case_messages
- JB-402 RLS cases (insert público, select admin)
- JB-403 Página `/contacto` con formulario que crea caso
- JB-404 Página `/seguimiento` con consulta por código + email
- JB-405 Edge Function `case-public-status` (consulta sin login)
- JB-406 Página `/admin/casos` listado con filtros
- JB-407 Página `/admin/casos/[id]` detalle con mensajes y notas
- JB-408 Acciones: cambiar estado, cambiar prioridad, asignar
- JB-409 Mensaje al cliente (visible) vs nota interna
- JB-410 Edge Function `send-case-notification` y `send-case-status-update`
- JB-411 Migración 008 + tracking de views
- JB-412 Dashboard `/admin` con datos reales (queries agregadas)
- JB-413 Componente de chart simple (visitas últimos 30 días)
- JB-414 Métricas top 5 artículos
- JB-415 Card de casos abiertos en dashboard

**Entregable:**

- Sistema de casos operativo end-to-end
- Cliente recibe email con código y puede consultar estado
- Dashboard con métricas reales

**Criterio de finalización:**

- Visitante completa contacto → recibe email con código → consulta estado → admin avanza estado → cliente recibe email
- Dashboard muestra contadores correctos

---

## Sprint 5 — Pulido visual + WhatsApp + páginas servicio + landing dinámica

**Duración estimada:** 4-6 días
**Objetivo:** Cumplir requerimientos visuales del cliente. Hero carousel, WhatsApp, servicios.

**Tareas incluidas:**

- JB-501 Componente `<WhatsAppButton />` floating + variante inline
- JB-502 Insertar WhatsApp en formularios contacto + caso + footer
- JB-503 Componente `<HeroCarousel />` con transiciones (Framer Motion)
- JB-504 Datos del carousel desde Supabase (tabla `home_slides` opcional o config en `.env`)
- JB-505 Sección Home: rediseño con menos texto y más visuales (iconografía y fotos)
- JB-506 Página `/servicios/[slug]` template para servicio individual
- JB-507 Migración tabla `services` + seeds
- JB-508 RLS services (lectura pública, escritura admin)
- JB-509 Admin CRUD básico de servicios (texto, hero, features)
- JB-510 Variación de color por categoría/blog (UI + DB campo `accent_color`)
- JB-511 Toolbar editor: insertar imagen desde Storage
- JB-512 Página de búsqueda dedicada `/buscar`
- JB-513 Robots.txt + sitemap completo
- JB-514 Open Graph dinámico para artículos (og-image)

**Entregable:**

- Home con hero animado y menos texto
- WhatsApp omnipresente
- Páginas de servicio individuales
- Landing visualmente más rica

**Criterio de finalización:**

- Cliente revisa visualmente: hero gira, WhatsApp en todas las CTAs, "consultas tributarias" tiene su propia página
- Variación de color visible en blog y categorías

---

## Sprint 6 — QA, hardening, deploy y producción

**Duración estimada:** 4-6 días
**Objetivo:** Pasar de "funciona en dev" a "funciona en producción de forma confiable".

**Tareas incluidas:**

- JB-601 Suite básica Vitest (unit) para utilities críticas (slug gen, rate-limit, sanitización)
- JB-602 Suite Playwright (E2E) flujo crítico: registro → comentar → moderar → publicar
- JB-603 Auditoría RLS: script que crea usuario test no-admin y verifica que no accede a borradores, casos ajenos, etc.
- JB-604 Auditoría XSS: insertar contenido malicioso en editor, verificar sanitización
- JB-605 Auditoría rate-limit: scripts que martillean endpoint comentario
- JB-606 Optimización imágenes: revisar `next/image`, Storage transformaciones, lazy loading
- JB-607 Lighthouse: target ≥ 90 perf, ≥ 95 a11y, ≥ 100 SEO en home y blog
- JB-608 Configurar Resend + dominio verificado
- JB-609 Deploy a Vercel con preview deployments
- JB-610 Configurar Vercel env vars (anon, service, resend, whatsapp)
- JB-611 Configurar dominio + SSL
- JB-612 Configurar Supabase backups automáticos
- JB-613 Configurar Vercel Analytics
- JB-614 Documentar runbook de incidentes (qué hacer si...)
- JB-615 Documentar `README.md` con onboarding para nuevos devs
- JB-616 Crear página de mantenimiento estática
- JB-617 Smoke tests post-deploy
- JB-618 Capacitación cliente (sesión + video del panel admin)
- JB-619 Plan de rollback documentado
- JB-620 GitHub Actions: lint + typecheck + tests en PR

**Entregable:**

- Sistema en producción accesible por dominio
- Backups y monitoreo activos
- Cliente capacitado

**Criterio de finalización:**

- URL pública accesible
- Lighthouse OK en pages clave
- Cliente puede crear un artículo desde el admin sin asistencia

---

## Sprint 7 (post-MVP / opcional)

**Objetivo:** Mejoras y deseables fuera del MVP.

- Newsletter automatizado con lista de suscriptores
- Comentarios con N niveles de threading
- Notificaciones in-app
- Multi-idioma (es-AR / es-PE / en)
- Stripe / MercadoPago para pagos
- Centro de notificaciones
- Dashboard avanzado con segmentación
- A/B testing en CTAs
- Cloudflare Turnstile

---

## Roadmap visual

```
Semana 1: Sprint 0 ━━━┓
Semana 2: Sprint 1 ━━━┫━━━━━━━━━━┓ (auth funcional)
Semana 3: Sprint 2 ━━━┫━━━━━━━━━━┫━━━━━━━━━━┓ (blog funcional)
Semana 4: Sprint 2 ━━━┛           │           │
Semana 5: Sprint 3 ━━━━━━━━━━━━━━━┛━━━━━━━━━━┫━━━━━━━━━┓ (comunidad)
Semana 6: Sprint 3                            │           │
Semana 7: Sprint 4 ━━━━━━━━━━━━━━━━━━━━━━━━━━┛━━━━━━━━━┫━━━━━┓ (casos + métricas)
Semana 8: Sprint 5 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛━━━━━┫ (pulido)
Semana 9: Sprint 6 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ (deploy)
```

## Hitos demo cliente

- **Demo 1 (fin Sprint 1):** Mostrar registro y login + admin protegido. Que cliente cree su cuenta admin.
- **Demo 2 (fin Sprint 2):** Cliente crea su primer artículo real desde admin con imagen real. Lo programa.
- **Demo 3 (fin Sprint 3):** Demo flujo comentario → moderación → publicado. Crear un hilo en foro.
- **Demo 4 (fin Sprint 4):** Demo formulario de contacto → caso con código → seguimiento.
- **Demo 5 (fin Sprint 6):** Sitio en producción con dominio. Capacitación.

## Qué NO hacer todavía

- ❌ Pasarela de pagos (queda fuera del MVP)
- ❌ Notificaciones in-app / push
- ❌ Multi-idioma (lanzamos en español)
- ❌ Newsletter automatizado complejo (puede ser un email manual desde admin)
- ❌ Sistema de roles fino (admin/user es suficiente — no editor/author/viewer separados)
- ❌ Comentarios con N niveles (1 nivel basta)
- ❌ Calendario editorial avanzado (basta ver programados)
- ❌ Multi-tenant (es un solo estudio)

## Qué reutilizamos del prototipo (alto valor)

- ✅ **Toda la UI:** premium aprobada por cliente, queda intacta
- ✅ **Componentes shared:** Breadcrumbs, Pagination, SearchBar, EmptyState, SectionHeader, PostImage
- ✅ **Layout admin:** sidebar y top bar
- ✅ **Layout público:** Header con motion + Footer
- ✅ **ArticleCard:** se conecta a data real
- ✅ **Mock data:** sirve como seed inicial para demo (los textos pueden quedar hasta que cliente provea)

## Qué refactorizamos antes de conectar backend

- 🔧 Mock data inline en `/admin/usuarios` → mover a `mock-data.ts` (Sprint 0)
- 🔧 Componente X SVG inline en `/admin/categorias` → lucide (Sprint 0)
- 🔧 `statusMap` repetido → `lib/status.ts` (Sprint 0)
- 🔧 Llamadas a `mock-data.ts` directas en pages → abstraer a `lib/queries/*` (Sprint 0)
- 🔧 Tipos de `mock-data.ts` → reemplazar por tipos generados de Supabase (Sprint 1)

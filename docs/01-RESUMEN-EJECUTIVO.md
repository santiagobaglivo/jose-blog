# Resumen Ejecutivo

## Contexto

**Proyecto:** Plataforma institucional con blog editorial y comunidad (foros) para estudio profesional (cliente: José Luis Crisóstomo Córdova).

**Estado actual:** Prototipo visual completo (front-end Next.js 16 + TypeScript + Tailwind + shadcn/ui) con datos mock. **Cero backend.** Build estable, responsive completo, diseño premium aprobado por cliente.

**Objetivo:** Transformar el prototipo en sistema productivo conectado a **Supabase** (PostgreSQL + Auth + Storage + Realtime + Edge Functions), con todas las funcionalidades operativas.

## Stack productivo

| Capa           | Tecnología                                 | Justificación                                                          |
| -------------- | ------------------------------------------ | ---------------------------------------------------------------------- |
| Front          | Next.js 16 (App Router) + TS               | Ya implementado                                                        |
| UI             | Tailwind 4 + shadcn/ui + Framer Motion     | Ya implementado                                                        |
| Backend        | Supabase                                   | DB + Auth + Storage + Realtime + Edge Functions en una sola plataforma |
| DB             | PostgreSQL 15+ (managed)                   | RLS para autorización                                                  |
| Auth           | Supabase Auth (email/pass + magic link)    | Sin OAuth en MVP                                                       |
| Storage        | Supabase Storage                           | Imágenes destacadas, avatares                                          |
| Editor blog    | TipTap                                     | Editor visual moderno con extensiones (rich text, links, imágenes)     |
| Email          | Resend (vía Edge Function)                 | Notificaciones moderación + casos                                      |
| Anti-spam      | Honeypot + rate-limit + (futuro) Turnstile | MVP simple                                                             |
| Validación     | Zod                                        | En cliente y servidor                                                  |
| Forms          | react-hook-form                            | Mejor DX y UX                                                          |
| Deploy         | Vercel                                     | Integración nativa Next.js                                             |
| Observabilidad | Vercel Analytics + Supabase logs           | MVP                                                                    |

## Alcance del trabajo

### En scope (MVP productivo)

- Sistema de autenticación (registro, login, perfil)
- CRUD de artículos del blog (admin) + vista pública
- Editor visual rich-text con upload de imágenes a Storage
- Programación de publicaciones (cron via Edge Function)
- Moderación de comentarios con cola pendiente/aprobados/rechazados
- Anti-spam básico (honeypot + rate-limit)
- Foros: categorías, hilos, respuestas, moderación
- Búsqueda en blog y foros (full-text con tsvector)
- Categorías y etiquetas (CRUD)
- Sistema de casos (contacto → caso con estado/seguimiento)
- WhatsApp + email en formularios
- Páginas adicionales por servicio (estructura escalable)
- Hero con carousel de imágenes (transición)
- Variación visual por categoría/blog
- Roles: admin, usuario
- Dashboard real con métricas
- RLS completo en todas las tablas
- SEO básico (metadata, sitemap, robots.txt, OG images)
- Performance + accesibilidad básica

### Fuera de scope (fase 2)

- Pasarela de pagos (Stripe/MercadoPago — discutido pero no parte del MVP)
- Sistema de notificaciones in-app
- Multi-idioma
- Multi-tenant
- Analytics avanzado / Custom dashboards
- Newsletter automatizado
- Comentarios anidados con N niveles (MVP: 1 nivel de respuesta a comentario)

## Estimación global

| Sprint                                                | Duración                 | Esfuerzo  |
| ----------------------------------------------------- | ------------------------ | --------- |
| Sprint 0 — Auditoría & setup                          | 3-5 días                 | 16h       |
| Sprint 1 — Auth & cimientos                           | 5-7 días                 | 32h       |
| Sprint 2 — Blog backend + editor                      | 8-10 días                | 60h       |
| Sprint 3 — Comentarios + Foros                        | 7-10 días                | 50h       |
| Sprint 4 — Casos + Dashboard                          | 5-7 días                 | 32h       |
| Sprint 5 — Pulido visual + WhatsApp + servicios extra | 4-6 días                 | 24h       |
| Sprint 6 — QA, hardening, deploy                      | 4-6 días                 | 24h       |
| **Total**                                             | **~6-8 semanas (1 dev)** | **~238h** |

## Hitos clave

1. **M1 (fin Sprint 1):** Usuario puede registrarse, loguearse y acceder al admin si tiene rol.
2. **M2 (fin Sprint 2):** Admin crea, edita, programa y publica artículos. Front público lee desde Supabase.
3. **M3 (fin Sprint 3):** Comentarios con moderación funcionando. Foros operativos.
4. **M4 (fin Sprint 4):** Sistema de casos con seguimiento. Dashboard con métricas reales.
5. **M5 (fin Sprint 6):** Sistema desplegado en producción con monitoreo y SEO.

## Decisiones técnicas tomadas (defaults razonables)

- **TipTap** sobre Lexical/Slate por madurez y ecosistema
- **Supabase Auth** sobre NextAuth por integración nativa con RLS
- **Resend** sobre SendGrid por DX y precio
- **Cron en Edge Function + pg_cron** para publicación programada
- **Slug generation** server-side con unicidad garantizada
- **Soft-delete** vía `deleted_at` para artículos y comentarios (no hard delete)
- **Storage público** para imágenes destacadas + avatares; firmas para uploads
- **Server Components por defecto** para datos del blog/foros (mejor SEO + perf)
- **Server Actions** para mutaciones simples; Edge Functions para tareas largas/cron

## Riesgos principales

| Riesgo                                    | Impacto | Mitigación                                                        |
| ----------------------------------------- | ------- | ----------------------------------------------------------------- |
| RLS mal configurado expone datos privados | Alto    | Test exhaustivo de policies, dual-account testing                 |
| Editor rich-text con XSS                  | Alto    | Sanitizado server-side con DOMPurify antes de persistir           |
| Spam masivo en comentarios/foros          | Medio   | Honeypot + rate-limit + moderación obligatoria + futuro Turnstile |
| Búsqueda lenta sin índices                | Medio   | Índices GIN sobre tsvector desde Sprint 2                         |
| Imágenes pesadas degradan Lighthouse      | Medio   | next/image + Storage transformaciones + límites de upload         |
| Cron de publicación falla silenciosamente | Medio   | Logging + alertas + monitoreo de Edge Function                    |
| Costos Supabase escalan inesperadamente   | Bajo    | Tier Free hasta cierto límite; alertas de uso                     |

## Pregunta crítica al cliente (bloqueante)

> **¿Es URGENTE el sistema de "seguimiento de casos" para el MVP?** Federico lo absorbió dentro del formulario de contacto. Si lo pedido es solo "form de contacto que el admin gestiona", queda Sprint 4. Si el cliente espera un portal con login + estado del caso visible para él, hay que reescalar.

Ver [05-PREGUNTAS-CLIENTE.md](./05-PREGUNTAS-CLIENTE.md) para el listado completo.

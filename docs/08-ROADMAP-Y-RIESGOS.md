# Roadmap, Riesgos y Orden de Ejecución

## Roadmap funcional (visión cliente)

| Hito                             | Cuándo    | Qué ve el cliente                                                                               |
| -------------------------------- | --------- | ----------------------------------------------------------------------------------------------- |
| **MVP-1: Auth + Blog operativo** | Sem. 4    | Puede crear su cuenta admin, escribir su primer artículo, publicarlo, subir imágenes, programar |
| **MVP-2: Comunidad activa**      | Sem. 6    | Lectores comentan, foros operativos, moderación funcional                                       |
| **MVP-3: Casos + métricas**      | Sem. 7-8  | Recibe consultas como casos con código, dashboard con datos reales                              |
| **MVP-4: Pulido visual**         | Sem. 8-9  | Hero animado, WhatsApp, páginas de servicio                                                     |
| **GA: Producción**               | Sem. 9-10 | Sitio en dominio público, capacitado para usar el panel                                         |

## Roadmap técnico (visión dev)

```
Mes 1
├── Sem 1: Sprint 0 (setup infra, refactor mínimo)
├── Sem 2: Sprint 1 (Auth + Profiles + RLS base)
├── Sem 3: Sprint 2A (Posts schema + editor + admin)
└── Sem 4: Sprint 2B (Blog público + búsqueda + scheduling)

Mes 2
├── Sem 5: Sprint 3A (Comments)
├── Sem 6: Sprint 3B (Foros)
├── Sem 7: Sprint 4 (Cases + dashboard)
└── Sem 8: Sprint 5 (Visual: hero, WhatsApp, servicios)

Mes 3
├── Sem 9: Sprint 6A (QA + tests)
├── Sem 10: Sprint 6B (deploy + capacitación)
└── (post-MVP / Sprint 7 según prioridades nuevas)
```

## Riesgos

### Técnicos

| Riesgo                                   | Probabilidad | Impacto | Mitigación                                                            |
| ---------------------------------------- | ------------ | ------- | --------------------------------------------------------------------- |
| **RLS mal configurado expone datos**     | Media        | Alto    | Test exhaustivo en Sprint 6, dual-account, scripts de auditoría       |
| **XSS via editor TipTap**                | Media        | Alto    | DOMPurify obligatorio server-side, whitelist tags estricta            |
| **Spam masivo bloquea moderación**       | Media        | Medio   | Honeypot + rate-limit + futuro Turnstile + cola pendiente obligatoria |
| **pg_cron no disponible en plan Free**   | Alta         | Medio   | Fallback con Vercel Cron (cron job HTTP a Edge Function cada 5 min)   |
| **Costos Supabase escalan**              | Baja         | Medio   | Monitor de uso desde día 1, optimización de queries, índices          |
| **Performance de búsqueda**              | Baja         | Medio   | Índices GIN desde Sprint 2, eventual paginación cursor-based          |
| **Imágenes pesadas degradan Lighthouse** | Media        | Bajo    | next/image + Storage transformaciones + límites upload                |

### Producto / Cliente

| Riesgo                                      | Probabilidad | Impacto | Mitigación                                                                                   |
| ------------------------------------------- | ------------ | ------- | -------------------------------------------------------------------------------------------- |
| **Cliente no entrega contenido a tiempo**   | Alta         | Alto    | Plantillas predefinidas, contenido placeholder profesional, calendario explícito de entregas |
| **Cambios de scope post-Sprint 3**          | Media        | Alto    | Sign-off escrito de scope al fin de Sprint 0, change requests con re-estimación              |
| **Confusión sobre "seguimiento de casos"**  | Alta         | Alto    | Reunión específica para definir alcance antes de Sprint 4                                    |
| **Cliente quiere features fase 2 en MVP**   | Alta         | Medio   | Roadmap claro fase 1 vs fase 2 firmado al inicio                                             |
| **Rotación de prioridades a último minuto** | Media        | Medio   | Backlog Jira con prioridades pactadas; mover a fase 2 si exceden tiempo                      |

### Operativos

| Riesgo                                     | Probabilidad | Impacto | Mitigación                                                             |
| ------------------------------------------ | ------------ | ------- | ---------------------------------------------------------------------- |
| **Email Resend rebota**                    | Baja         | Medio   | Verificar dominio, SPF/DKIM correcto, fallback a SMTP si hace falta    |
| **Cliente no recibe código de caso**       | Baja         | Alto    | UI muestra código en pantalla post-submit (no solo en email), copiable |
| **Backups no funcionan cuando hace falta** | Muy baja     | Crítico | Test restore mensual, monitoring activo                                |

## Orden recomendado de implementación (tarea por tarea)

### Fase 1: Cimientos (debe estar antes de tocar feature)

1. JB-001 → JB-014 (Sprint 0 completo)

### Fase 2: Auth funcional

2. JB-101 → JB-105 (migraciones DB)
3. JB-106 → JB-118 (Auth, profile, header reactivo, /admin guard)
4. **🚦 Demo cliente: registro, login, edición de perfil**

### Fase 3: Blog admin

5. JB-201 → JB-208 (schema + editor + componentes)
6. JB-209 → JB-216 (admin pages + scheduling)
7. **🚦 Demo cliente: crear artículo de punta a punta**

### Fase 4: Blog público

8. JB-217 → JB-224 (público + búsqueda + SEO + accent_color)
9. **🚦 Demo cliente: blog público funcional**

### Fase 5: Comentarios

10. JB-301 → JB-310

### Fase 6: Foros

11. JB-311 → JB-322
12. **🚦 Demo cliente: comunidad operativa**

### Fase 7: Casos + Dashboard

13. JB-401 → JB-415
14. **🚦 Demo cliente: caso end-to-end**

### Fase 8: Pulido visual

15. JB-501 → JB-514
16. **🚦 Demo cliente: revisión visual completa**

### Fase 9: Hardening

17. JB-601 → JB-620
18. **🚀 Lanzamiento**

## Cosas que NO hacer todavía (anti-roadmap)

| Item                                             | Por qué no                                                    | Cuándo sí                                     |
| ------------------------------------------------ | ------------------------------------------------------------- | --------------------------------------------- |
| **Pasarela de pagos (Stripe / MercadoPago)**     | Federico mencionó pero está fuera de scope MVP                | Fase 2, después de 3 meses en producción      |
| **Notificaciones in-app / push**                 | Complejidad alta, beneficio bajo en MVP                       | Fase 2                                        |
| **Multi-idioma**                                 | Cliente es uno solo, español argentino                        | Cuando expandan a otros mercados              |
| **Stripe via Mercury (apertura empresa US)**     | Out of scope técnico — es decisión legal/contable del cliente | Cuando el cliente lo decida y sea fase 2      |
| **Newsletter automatizado**                      | Requiere doble opt-in, gestión de listas, anti-spam serio     | Fase 2 con Resend audiences                   |
| **Comentarios anidados N niveles**               | UX más compleja sin claro beneficio                           | Si el uso lo demanda                          |
| **Dashboard analytics avanzado**                 | Vercel Analytics / Plausible cubren MVP                       | Cuando crezca el volumen                      |
| **Sistema de roles fino (editor, viewer, etc.)** | admin/user es suficiente                                      | Cuando haya 5+ admins                         |
| **Editor colaborativo en tiempo real**           | TipTap soporta pero adds complexity                           | Si llegan a tener equipo de varios redactores |
| **A/B testing**                                  | Requiere baseline de tráfico                                  | Fase 2                                        |
| **Comentarios con embed YouTube/Twitter**        | XSS surface adicional                                         | Si lo piden explícitamente                    |
| **Gamificación foros (badges, reputation)**      | Out of scope                                                  | Solo si la comunidad crece y lo justifica     |

## Reutilización del prototipo actual (alto valor)

### ✅ Conservar tal cual

- Todos los componentes de `src/components/ui/` (shadcn)
- `src/components/shared/*`
- `src/components/blog/article-card.tsx`
- `src/components/layout/header.tsx` (extender con auth, no rehacer)
- `src/components/layout/footer.tsx`
- `src/components/shared/post-image.tsx`
- Globalstyle del prototipo (`globals.css`)
- Toda la paleta y tipografía
- Estructura de rutas (route groups, layouts)

### 🔄 Conservar UI, cambiar fuente de datos

- Todas las pages existentes (públicas y admin)
- El prototipo es una guía visual exacta de cómo deben verse las pages funcionales

### 🔧 Refactorizar antes de conectar

- Mock data inline en `/admin/usuarios` → mover a `mock-data.ts` (JB-005)
- Componente X SVG inline → lucide (JB-006)
- statusMap repetido → centralizar (JB-004)
- Llamadas a mock-data desde pages → vía `lib/queries/*` (JB-003)
- Tipo `Post` con `slug` como ID → reemplazar por tipos generados de Supabase

### ⚠️ Eliminar / replantear

- `src/lib/mock-data.ts` puede mantenerse como seed inicial pero las pages no deben depender directamente de él

## Decisiones técnicas que requieren pronunciamiento

(repaso para decidir antes de Sprint 1)

| Decisión               | Default sugerido                      | Quién decide                  |
| ---------------------- | ------------------------------------- | ----------------------------- |
| Editor blog            | TipTap                                | Tech lead                     |
| Auth provider          | Solo email/password MVP               | Tech lead + cliente           |
| Email provider         | Resend                                | Tech lead                     |
| Hosting                | Vercel                                | Tech lead                     |
| pg_cron vs Vercel cron | pg_cron si plan Pro, sino Vercel cron | Tech lead                     |
| Comentarios anónimos   | Permitidos con moderación             | **Cliente**                   |
| Acceso lectura foros   | Público sin login                     | **Cliente**                   |
| Acceso escritura foros | Solo registrados                      | Tech lead                     |
| Captcha                | Honeypot MVP, Turnstile post-MVP      | Tech lead                     |
| Soft delete retention  | 30 días                               | Tech lead                     |
| Storage public         | post-images y avatars públicos        | Tech lead                     |
| Backups                | PITR si plan Pro                      | **Cliente** (depende de plan) |
| Dominio                | A definir                             | **Cliente**                   |
| Email admin            | A definir                             | **Cliente**                   |

## Métricas de éxito post-lanzamiento

A medir desde mes 1 en producción:

- 📈 **Visitas mensuales** (target: crecimiento sostenido)
- 📝 **Artículos publicados/mes** (target: ≥4/mes — cadencia editorial)
- 💬 **Comentarios aprobados/mes** (target: ≥10/mes — engagement)
- 🗣️ **Hilos creados/mes** en foros (target: ≥5/mes)
- 📩 **Casos creados/mes** (target: ≥10/mes — conversión)
- ⏱️ **Tiempo medio de respuesta a casos** (target: <24h)
- ✅ **Lighthouse score** (target: ≥90 perf, ≥95 a11y, 100 SEO)
- 🔒 **Cero incidentes de seguridad**

Si tras 3 meses el cliente no usa activamente el panel, replantear capacitación. Si los foros quedan vacíos, replantear si vale la pena mantenerlos (puede ser fase 2 elimable).

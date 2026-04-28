# jose-blog

Plataforma de contenido y comunidad para una firma profesional: blog editorial, foros con moderación y panel administrativo. El proyecto convierte un prototipo visual en un sistema productivo respaldado por Supabase.

La documentación funcional, arquitectónica y de planificación vive en [`docs/`](./docs/00-INDEX.md).

## Stack técnico

- **Framework:** Next.js 16 (App Router) + React 19
- **Lenguaje:** TypeScript estricto
- **UI:** Tailwind CSS v4, shadcn/ui, Base UI, Framer Motion
- **Editor:** TipTap
- **Forms y validación:** React Hook Form + Zod
- **Backend:** Supabase (Postgres, Auth, Storage, RLS, Edge Functions)
- **Email transaccional:** Resend
- **Tooling:** ESLint 9, Prettier 3, Supabase CLI

> Esta versión de Next.js incluye breaking changes respecto a versiones previas. Consultar `node_modules/next/dist/docs/` antes de modificar APIs del framework.

## Setup local

### Requisitos

- Node.js 20+
- npm 10+
- [Supabase CLI](https://supabase.com/docs/guides/cli)
- Cuenta en Supabase y Resend

### Instalación

```bash
npm install
cp .env.example .env
```

Completar `.env` con las credenciales reales:

| Variable                        | Origen                                          |
| ------------------------------- | ----------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase → Project Settings → API               |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API               |
| `SUPABASE_SERVICE_ROLE_KEY`     | Supabase → Project Settings → API (server-only) |
| `RESEND_API_KEY`                | Resend → API Keys                               |
| `RESEND_FROM`                   | Remitente verificado en Resend                  |
| `NEXT_PUBLIC_WHATSAPP_NUMBER`   | Número de contacto, código país sin `+`         |
| `NEXT_PUBLIC_SITE_URL`          | URL pública del sitio en producción             |

### Base de datos

Vincular el proyecto local con Supabase y aplicar migrations:

```bash
supabase link --project-ref <project-ref>
npm run db:push
npm run db:types
```

### Desarrollo

```bash
npm run dev
```

Servidor disponible en [http://localhost:3000](http://localhost:3000).

## Comandos disponibles

| Comando                | Descripción                                                     |
| ---------------------- | --------------------------------------------------------------- |
| `npm run dev`          | Servidor de desarrollo                                          |
| `npm run build`        | Build de producción                                             |
| `npm run start`        | Servidor de producción tras `build`                             |
| `npm run lint`         | ESLint sobre todo el repo                                       |
| `npm run format`       | Prettier en modo escritura                                      |
| `npm run format:check` | Prettier en modo verificación (CI)                              |
| `npm run db:push`      | Aplica las migrations pendientes al proyecto Supabase vinculado |
| `npm run db:reset`     | Reset destructivo de la base remota vinculada                   |
| `npm run db:types`     | Genera `src/types/database.ts` desde el schema remoto           |

## Estructura de carpetas

```
jose-blog/
├── docs/              Documentación del proyecto (ver docs/00-INDEX.md)
├── public/            Assets estáticos
├── scripts/           Utilidades de mantenimiento (Jira, etc.)
├── src/
│   ├── app/           Rutas App Router
│   │   ├── (public)/  Sitio público: blog, foros, perfil, contacto
│   │   └── admin/     Panel administrativo
│   ├── components/    Componentes UI agrupados por dominio
│   │   ├── admin/
│   │   ├── blog/
│   │   ├── forum/
│   │   ├── layout/
│   │   ├── shared/
│   │   └── ui/        Primitivas shadcn/ui
│   ├── lib/
│   │   ├── queries/   Acceso a datos por entidad
│   │   └── supabase/  Clientes browser, server y middleware
│   └── types/         Tipos generados y manuales
└── supabase/
    ├── config.toml
    └── migrations/    Migrations versionadas
```

## Documentación adicional

Para profundizar en alcance, modelo funcional, arquitectura Supabase, plan de sprints, backlog y roadmap, ver el índice de documentación en [`docs/00-INDEX.md`](./docs/00-INDEX.md).

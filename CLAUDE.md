# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Next.js 16 — read before writing framework code

This project runs on Next.js 16 + React 19. There are concrete breaking changes from earlier versions; check `node_modules/next/dist/docs/` for the relevant guide before touching framework APIs. One that bites immediately:

- **Middleware lives in `src/proxy.ts`, not `src/middleware.ts`**, and the exported function is `proxy(request)`. The `config.matcher` shape is unchanged.

When in doubt about a Next API surface (caching, route handlers, params, etc.), assume the v15-and-earlier shape may be wrong and verify against the bundled docs.

## Commands

```bash
npm run dev              # next dev (http://localhost:3000)
npm run build            # next build
npm run lint             # eslint (flat config, eslint.config.mjs)
npm run format           # prettier --write .
npm run format:check     # prettier --check .

# Supabase (requires `supabase link --project-ref <ref>` first)
npm run db:push          # apply pending migrations to linked remote
npm run db:reset         # DESTRUCTIVE: reset linked remote DB
npm run db:types         # regenerate src/types/database.ts from remote schema
```

After any schema change in `supabase/migrations/`, run `npm run db:push && npm run db:types` so the `Database` type stays in sync — query files import `Tables<"...">` and typed `.from(...)` calls from this generated file.

### Tests

There is no `npm test` script. Tests use Node's built-in runner (`node:test` + `node:assert/strict`). Currently only `src/lib/editor/sanitize.test.ts` exists. Run a single test file with:

```bash
node --test --experimental-strip-types src/lib/editor/sanitize.test.ts
```

`tsconfig.json` excludes `**/*.test.ts` from the TypeScript program so test files don't ship to the Next build.

## Architecture

### Supabase client triad

Three distinct clients in `src/lib/supabase/`. Pick the right one — they aren't interchangeable:

- **`client.ts`** → `createClient()`: browser, anon key, used by Client Components (e.g., `UserProvider`).
- **`server.ts`** → `createClient()` (async): Server Components / Server Actions / Route Handlers. Wires Supabase cookies through `next/headers`. The `setAll` catch is intentional — when called from a pure Server Component the proxy refreshes the session instead.
- **`admin.ts`** → `createAdminClient()`: service-role key, **server-only**, bypasses RLS. Use only when an action genuinely needs to escape RLS.
- **`middleware.ts`** → `updateSession(request)`: invoked from `src/proxy.ts` on every matched request. Refreshes the auth token, syncs cookies between request/response, and gates `/admin/*` (redirects unauthenticated users to `/auth/login`, non-admins to `/`).

Never insert code between `createServerClient(...)` and `supabase.auth.getUser()` inside `updateSession` — token refresh + cookie sync depend on that ordering.

### Auth gating is layered, on purpose

`/admin/*` access is enforced in **three** places. Don't remove any of them:

1. `proxy.ts` → `updateSession` → middleware-level redirect for unauthenticated/non-admin users (cheap, runs first).
2. `src/app/admin/AdminGuard.tsx` → server-component guard wrapping the admin layout (defense in depth, runs in RSC render).
3. RLS policies in `supabase/migrations/*_rls_*.sql` (last line of defense at the database).

`UserProvider` (`src/lib/auth/UserProvider.tsx`) is a client-side context hydrated from server-fetched `initialUser` + `initialProfile`, then kept fresh via `supabase.auth.onAuthStateChange`. Use `useUser()` / `isAdmin` in client components — don't refetch the session.

### App Router layout

```
src/app/
├── (public)/      Route group: blog, foros, perfil, contacto, sobre-nosotros
├── admin/         Admin panel — wrap pages with AdminGuard / AdminShell
├── auth/          login, registro, recuperar, reset-password + actions.ts (server actions)
├── layout.tsx     Root: hydrates UserProvider with server-fetched user/profile
└── proxy.ts       Middleware (see Next.js 16 note above)
```

Server Actions for auth live in `src/app/auth/actions.ts`. They return discriminated `{ ok: true } | { ok: false, error }` results — keep that shape; the forms depend on it. Generic error strings are deliberate (avoid email enumeration on signup/reset).

### Data access

`src/lib/queries/{posts,categories,comments,forums,users}.ts` is the data-access layer. Currently mid-migration: `posts.ts` mixes real Supabase queries (e.g., `getAllPostsAdmin` uses Postgres FTS via `search_vector` with the `spanish` config) with mock-data fallbacks from `src/lib/mock-data.ts`. When wiring a feature to real data, replace the mock helper rather than adding parallel real/mock branches.

Key schema notes that affect query shape:
- `posts.search_vector` is a generated `tsvector` (weights A/B/C on title/excerpt/content_html, Spanish config) → use `.textSearch("search_vector", q, { type: "websearch", config: "spanish" })`.
- Soft delete via `deleted_at` — list queries must `.is("deleted_at", null)`.
- `post_status` enum: `draft | scheduled | published | archived`.
- `user_role` enum: `admin | user` (admin gating reads `profiles.role`).

### Content sanitization

TipTap content is stored as both `content jsonb` and `content_html text`. Anything user-authored that gets rendered as HTML must go through `sanitizeHtml` from `src/lib/editor/sanitize.ts` (DOMPurify-based; tested against XSS payloads in `sanitize.test.ts`). Don't render raw `content_html` from untrusted sources without it.

### Validation

Zod schemas live in `src/lib/validators/`. Server actions re-parse with `safeParse` even when the client already validated — never trust client-validated input.

## Project documentation

The `docs/` directory contains the authoritative functional/architectural plan (see `docs/00-INDEX.md`). When scope or schema questions come up, check there before guessing — particularly `04-ARQUITECTURA-SUPABASE.md` for tables/RLS and `07-BACKLOG-JIRA.md` for per-task acceptance criteria.

## Conventions

- Path alias: `@/*` → `src/*`.
- shadcn/ui primitives in `src/components/ui/`, domain components grouped by feature (`admin/`, `blog/`, `forum/`, `layout/`, `shared/`).
- Prettier: 2-space, double quotes, semicolons, trailing comma `es5`, 100-col.
- Spanish is the product language — route segments (`articulos`, `foros`, `perfil`), UI copy, and user-facing error strings are all in Spanish. Keep that consistent; identifiers and code comments stay in the existing mix (mostly English identifiers, Spanish comments where they exist).

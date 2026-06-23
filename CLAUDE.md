# CLAUDE.md

See CONTEXT.md for a brief product introduction and ubiquitous language definitions. Read these only when you come across a relevant feature, not if I ask for something purely technical. Similarly, there are various ADRs in docs/adr that explain the thought process behind certain features: Read only when highly relevant.  

## Stack & priorities

Next.js (App Router) + TypeScript + React, styled with CSS Modules. Hosted on Vercel.

- Optimize aggressively.
- Default to static rendering; use composition to achieve more statically rendered components.
- Lean heavily into Zod for validation, type coercing, and runtime type checks.
- When working with Recipes, Ingredients, Menus, or other databse entries, ALWAYS use- or derive the schema and type from those existing declarations.

## Commands

- `pnpm lint --fix path/to/file` — Biome (lint + format). Always run this after touching files.
- `pnpm test path/to/test.ts` — single test

## Key Rules

- **Multi-tenant**: All DB queries must be scoped by `orgId` from `authOrForbidden()` (`src/utils/auth.ts`)
- All DB queries should attempt to read from cache, and all mutations should clear related caches (see cache event model at `src/utils/cache.ts`)
- If unsure about a domain term (e.g. Quota, Use, Grant), check `CONTEXT.md`.

## Monorepo (Turborepo: `apps/*` + `packages/*`)

**Purity is load-bearing — Expo/RN consumes the pure packages.** Before adding an import or a call inside `schema` or `domain`, confirm it keeps them pure & RN-safe: no `next/*`, no DB/server SDKs, no DOM, **and no side effects** — a network/LLM/Vision call is server-side (→ `api`) even if it imports nothing forbidden (the Biome guard is lexical; it can't catch this, only you can). `db` + `api` are server-only; `mobile` imports `schema`/`domain` for values and `import type { AppRouter }` from `api` only.

When deciding where code belongs — a new file, a move, or a helper/schema/function you're adding that could live in a shared package — read `docs/monorepo.md`.

## Nits

- Prefer `function` over `const` for function declarations
- Do NOT add comments to code, unless it truly is genuinely hard to follow without it. Never  narrate the decision flow or, restate what the code already implicitly states via variable names.

## Next.js docs

- Next.js bundles its full, version-pinned docs at `node_modules/next/dist/docs/` (`01-app` = App Router, which we use). Always read these over web search or training data for Next.js APIs (Cache Components, `use cache`/`cacheLife`/`cacheTag`/`updateTag`, routing, metadata)

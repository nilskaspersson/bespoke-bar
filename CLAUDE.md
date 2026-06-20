# CLAUDE.md

See CONTEXT.md for a brief product introduction and ubiquitous language definitions. Read these only when you come across a relevant feature, not if I ask for something purely technical. Similarly, there are various ADRs in docs/adr that explain the thought process behind certain features: Read only when highly relevant.  

## Stack & priorities

Next.js (App Router) + TypeScript + React, styled with CSS Modules. Hosted on Vercel.

- Optimize aggressively.
- Default to static rendering; use composition to achieve more statically rendered components.
- Lean heavily into Zod for validation, type coercing, and runtime type checks.
- When working with Recipes, Ingredients, Menus, or other databse entries, ALWAYS use- or derive the schema and type from those existing declarations.

## Commands

- `npm run lint -- --fix path/to/file` — Biome (lint + format). Always run this after touching files.
- `npm run test -- path/to/test.ts` — single test

## Key Rules

- **Multi-tenant**: All DB queries must be scoped by `orgId` from `authOrForbidden()` (`src/utils/auth.ts`)
- All DB queries should attempt to read from cache, and all mutations should clear related caches (see cache event model at `src/utils/cache.ts`)
- If unsure about a domain term (e.g. Quota, Use, Grant), check `CONTEXT.md`.

## Nits

- Prefer `function` over `const` for function declarations
- Do NOT add comments to code, unless it truly is genuinely hard to follow without it. Never  narrate the decision flow or, restate what the code already implicitly states via variable names.

## Next.js docs

- Next.js bundles its full, version-pinned docs at `node_modules/next/dist/docs/` (`01-app` = App Router, which we use). Always read these over web search or training data for Next.js APIs (Cache Components, `use cache`/`cacheLife`/`cacheTag`/`updateTag`, routing, metadata)

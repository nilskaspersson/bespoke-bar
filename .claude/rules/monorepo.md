# Monorepo (Turborepo + pnpm)

> **Status: live (extraction in progress).** Step 0 (Turborepo container) and Step 1 (`packages/schema`, the pure leaf) have landed, so the `schema` rules below are enforced now (Biome purity guard + CI). Steps 2–6 (`domain`, `db`, `api`, `lounge`, `mobile`) are the documented target, not yet built — `plans/monorepo-extraction.md` tracks the sequence. Rationale: ADR-0009/0010/0011.

Layout: `apps/{bar,lounge,mobile}` (deployables) + `packages/{schema,domain,db,api,ui}` (private `workspace:*`, imported as `@bespoke/*`, **never published**). `bar` = authed app (`bar.bespoke-bar.app`); `lounge` = public landing + guest menus (apex); `mobile` = one Expo codebase → iOS + Android.

## The one load-bearing boundary: pure vs server

The split exists so the React Native bundle never pulls in server code. Honour this above all other tidiness:

* **`schema` + `domain` are PURE and RN-safe.** No `next/*`, no DB connection, no server SDKs (`@clerk/*server`, `@google*`, `@upstash/*`, pg/neon), no `react-dom`, no `@lexical/*`, no DOM. These are the only packages `apps/mobile` imports for *values*.
* **`db` + `api` are SERVER-ONLY** — never imported by `apps/mobile`.
* **"Pure" means no side effects, not merely no banned imports.** An LLM/Vision/network call is server-side (`api`) even if it imports nothing forbidden.
* Mobile's only link to the server is `import type { AppRouter }` from `api` (types erase at build) — never a value import.

## Package responsibilities

* **`schema`** — Drizzle tables + drizzle-zod + inferred types + pure schema helpers + `appError` (the Zod error envelope; the shared error contract clients parse).
* **`domain`** — pure logic only: parsers, `stitch*`, cost/ABV, unit `convert`, currency, validation. No React.
* **`db`** — thin & Next-free: the connection, `drizzle.config.ts`, migrations, constraint-error helpers. *Nothing else.*
* **`api`** — all other server code, **files intact**: tRPC router + context, services, `use cache` wrappers, the cache-event model, auth, rate-limiting, LLM/Vision. Next-coupled. **Do not split service files** along a db/api line — both halves run only on the BE, so the seam buys nothing.
* **`ui`** — web DOM only, shared by `bar` + `lounge` (never `mobile`): the `src/ui` primitives, the theme (it *owns* the `@layer` declaration; each app imports it once, before any module CSS), the icon system, generic hooks. Promote shared feature-display components (recipe cards, metrics, read-only menu lists) here **from `bar`** only when `lounge` actually consumes them — on second use, not speculatively.

## Deciding where code goes (shape → reasoning → server)

`schema` and `domain` are *both* pure and RN-safe, so "mobile needs it" never decides between them. The cut is **data shape → reasoning → server**:

* **`schema`** — meaning *intrinsic to the data shape*: the table, its drizzle-zod in/out schemas, inferred types, an enum + a predicate that just names which members mean what (`isProActive`), the normalization the column itself stores (`normalizeIngredientName`, `sqlNormalizedString`), the wire error envelope (`appError`). Changes only when the column does.
* **`domain`** — *pure reasoning that composes data or encodes policy*: cost/ABV, unit `convert`, the text→lines parser, entitlement/quota math (`deriveOCRQuotaState`, slot limits, the `PRO_*` constants). Changes when business rules change, not when the schema does.
* **`api`** — anything touching the DB driver, Stripe, cache (`use cache`), auth, or an SDK. Whole service/read files.
* **stays in the app** — feature-/form-/route-coupled code: Conform form schemas, tRPC input shapes, React components, anything importing `@/ui` or Lexical.

Worked example — `orgSubscriptions`: table + `subscriptionStatusSchema` + `isProActive` are shape → **`schema`**; `getOCRQuotaLimit` / slot math / `PRO_*_BONUS` are policy → **`domain`**; `upsertOrgSubscription` / `stripeWebhook` touch Stripe+DB → **`api`**.

Two standing rules:
* **Keep `schema` thin.** It is the RN-safe leaf; the moment it hosts "logic" it attracts impure creep (a date lib, a Stripe type). When torn between `schema` and `domain`, choose `domain` — only genuinely shape-intrinsic helpers belong in `schema`.
* **The trigger to extract is reuse, not tidiness.** Promote code to a package when a second consumer (mobile/lounge) actually needs it, not speculatively.

## Conventions

* Derive every entity type/schema from the Drizzle declarations (CLAUDE.md); they live in `schema`.
* The tRPC contract is **additive-only**, per-procedure-versioned, floor-gated (ADR-0009). On any mobile-reachable procedure: never narrow an input, never remove/retype an output, never remove the procedure; new `appError` codes are additive too. Send `x-app-version` + `x-platform` on every call from the first build.
* The tRPC **client** is per-app (`bar` and `mobile` each own one); only the **router type** is shared.
* Install RN deps with `expo install`, never `pnpm add` — it pins SDK-compatible versions.
* Server→mobile leaks are caught by a per-package Biome `noRestrictedImports` guard (`packages/<pure>/biome.json`, `root: true`), **not** pnpm strict resolution — `node-linker: hoisted` (step 0) defeats resolution-based enforcement (ADR-0010 amendment). The guard is lexical (bans specifier strings); the Metro bundle is the transitive backstop. Keep `turbo run lint` green rather than relying on discipline.
* DB access stays scoped to the **Active Organisation** (`orgId`), as today.
* For Turborepo / Expo / Drizzle / Clerk / tRPC APIs, read version-pinned docs (`node_modules/<pkg>`, vendored `llms.txt`) over training or web — they ship faster than the cutoff.

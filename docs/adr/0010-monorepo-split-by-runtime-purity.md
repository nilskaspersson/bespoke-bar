# The project becomes a pnpm + Turborepo monorepo split by runtime purity, so the Expo app can reuse domain logic without ever bundling server code

The single Next.js app is being decomposed into a monorepo (`apps/` + `packages/`) to host
an **Expo** iOS client alongside the existing web app, a marketing landing page on the apex
domain, and (later) static guest-menu pages. The forcing function is mobile: a native
binary can't consume RSC or server actions, so it calls the existing tRPC router over HTTP.
Everything else is optional decomposition chosen for reuse, not necessity. The web app stays
an RSC monolith — it is *not* demoted to an API client.

Packages are split **by runtime purity**, not by feature, because the hard constraint is
that the React Native bundle must never pull in the database driver, `next/cache`, or any
server SDK:

- `packages/schema` — Drizzle tables + drizzle-zod + inferred types. Pure; the single
  source of truth (CLAUDE.md). Mobile imports its *values*. Accepting `drizzle-orm` into the
  RN bundle (column/schema code only, never a driver) is the deliberate price of not forking
  the schema.
- `packages/domain` — pure logic: `stitchRecipe`, `getRecipeCost`/`getLineCost`, unit
  `convert`, currency, and the dependency-free text→lines parser (`userInputToLine`,
  `tokenizeLine`, `transformRecipeText`) lifted out of `recipes/bulk/`. This is what gives
  mobile authoring-semantics parity *without* a line of Lexical.
- `packages/db` — **thin and Next-free**: the connection (`src/db/index.ts`),
  `drizzle.config.ts`, migrations, and constraint-error helpers. Nothing else — services are
  *not* split into it.
- `packages/api` — **all server-side code, files intact**: the tRPC router + context, every
  service and read file (prepared query and its `use cache` wrapper together), the cache-event
  model, auth, rate-limiting, and the LLM/Vision layer. Server-only and **deliberately
  Next-coupled** (below). Mobile imports only its `AppRouter` *type* (`import type`, erased at
  build).
- `packages/ui` — **primitives** (the 48 `src/ui` components), the `_theme` tokens + the
  `@layer` declaration (which it *owns*; each app imports it once, before any module CSS), and
  the icon system. Shared by the web apps via `transpilePackages`; **not** mobile. A second
  tier of shared *feature-display* components (recipe cards, the metrics family, read-only menu
  lists) is promoted here from `apps/bar` only when the Lounge needs them — on second use, not
  speculatively.

The web apps consume `ui` + `api` (value) + `domain`; the Expo app consumes `schema` +
`domain` values and the `AppRouter` type. The Lexical editor and all DOM UI stay in
`apps/bar`.

## Considered options

- **One app, share types only (no extraction).** Mobile would import the router type from
  `apps/bar` — an app→app dependency that breaks build-graph isolation. Extracting
  `packages/api` is precisely what makes `AppRouter` importable without that coupling.
- **Runtime-agnostic `packages/api` (lift `use cache` to the app layer).** Would let the API
  be hosted off Next someday, but the data layer already bakes `use cache`/`cacheTag` into
  the fetchers the router calls (ADR-0007/0008). Next is the permanent host, so we keep the
  coupling rather than abstract caching behind an interface for portability we don't want.
- **Nx instead of Turborepo.** More powerful (codegen, project graph) but heavier than a
  small TS monorepo needs. Turbo is Vercel-native with free remote caching; revisit Nx only
  if we outgrow it.
- **npm workspaces or Bun.** npm hoists flat (works with Expo) but its loose isolation lets a
  phantom dep mask a server→mobile import — the exact failure this split exists to prevent.
  Bun's Expo/Metro support is still rough. pnpm's strict resolution *enforces* the
  boundaries, so it is a correctness tool here, not just a faster installer.
- **Publishing the packages.** Unneeded — these are private `workspace:*` packages, not
  versioned npm artifacts.

## Consequences

- **pnpm strictness is a guardrail:** mobile cannot resolve `packages/db` unless it declares
  the dependency, turning "server code leaked into the bundle" into an install-time error.
  Backed by a dependency-cruiser/Biome boundary rule, the split becomes mechanical.
- Shared dev tooling is pinned once via pnpm **catalogs** (`typescript`, `react`, Biome); one
  root `biome.json` lints every app including Expo (no RN-specific rules — add a thin ESLint
  for `apps/mobile` only if ever needed).
- **The `db`↔`api` split is server-internal organization, not a safety boundary** — both are
  server-only and neither ships to mobile, so services and read files move *whole* into
  `packages/api`; only the connection + migrations sit in the (Next-free) `packages/db`. The
  genuine refactor cost is the **pure/server extraction** instead — getting `packages/schema`
  and `packages/domain` clean (e.g. pulling pure `quantityToBestUnit`/`roundUnit` out of their
  formatter hooks so `transformRecipeText` stops importing React).
- The Lexical editor does **not** cross to React Native, by decision — mobile gets a native
  authoring surface over the same parsed model. Revisit only if a cross-platform editor earns
  its keep.
- Per ADR-0009, the shared `AppRouter` type makes "does mobile call this procedure?" the gate
  on every non-additive change to the one router.

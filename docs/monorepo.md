# Where code goes (monorepo placement)

Purity (`schema`/`domain` pure & RN-safe; `db`/`api` server-only) lives in CLAUDE.md and is non-negotiable. This doc is the softer call — which package a *new* file belongs in. For *why* the split exists, the tRPC contract rules, and mobile/Expo conventions, read ADR-0009/0010/0011.

## The cut: shape → reasoning → server

`schema` and `domain` are both pure, so "mobile needs it" never decides between them. Decide by what the code *is*:

* **`schema`** — meaning *intrinsic to the data shape*: the table, its drizzle-zod in/out schemas, inferred types, an enum + a predicate naming which members mean what (`isProActive`), the normalization the column itself stores (`normalizeIngredientName`, `sqlNormalizedString`), the wire error envelope (`appError`). Changes only when the column does.
* **`domain`** — *pure reasoning that composes data or encodes policy*: cost/ABV, unit `convert`, the text→lines parser, entitlement/quota math (`deriveOCRQuotaState`, slot limits, `PRO_*` constants). Changes when business rules change, not when the schema does.
* **`api`** — anything touching the DB driver, Stripe, cache (`use cache`), auth, or an SDK. Whole service/read files, intact — don't split them along a db/api line.
* **`db`** — only the connection, `drizzle.config.ts`, migrations, constraint-error helpers.
* **`ui`** — web DOM primitives + theme (owns the `@layer` declaration) + icons, shared by `bar` + `lounge` (never `mobile`).
* **stays in the app** — feature-/form-/route-coupled code: Conform schemas, tRPC input shapes, React components, anything importing `@/ui` or Lexical.

Worked example — `orgSubscriptions`: table + `subscriptionStatusSchema` + `isProActive` are shape → **`schema`**; `getOCRQuotaLimit` / slot math / `PRO_*_BONUS` are policy → **`domain`**; `upsertOrgSubscription` / `stripeWebhook` touch Stripe+DB → **`api`**.

## Two standing rules

* **Keep `schema` thin.** It's the RN-safe leaf; the moment it hosts "logic" it attracts impure creep (a date lib, a Stripe type). When torn between `schema` and `domain`, choose `domain`.
* **Extract on reuse, not tidiness.** Promote code to a package (or a component into `ui`) when a second consumer (mobile/lounge) actually needs it — on second use, not speculatively.

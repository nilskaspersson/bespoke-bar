# Offline Dev Auth

A development-only way to run the **bar** app with no network (e.g. on a plane).
The app's only hard network dependency for local work is **Clerk** (auth) — the
DB is your local Docker Postgres, the data cache is Next.js' own `use cache`
(local), and `rateLimit` / enrichment quota / billing / OCR all no-op or sit off
the browse-and-edit path when their services aren't configured. So stubbing Clerk
is enough to work fully offline.

> **Naming:** this is **Offline Dev Auth** — a dev convenience that fakes a
> signed-in user. It is _not_ "offline auth" in the product sense (a future
> offline-capable mobile app holding a real session); the `dev` is load-bearing.
> See the CONTEXT.md glossary entry.

## Enabling it

Add to `apps/bar/.env`:

```
NEXT_PUBLIC_OFFLINE_DEV_AUTH=1
```

Then `pnpm dev` as usual. That's it — you're signed in as a fixed local
identity and nothing reaches the network.

## How it works

Clerk can't run offline at all: sessions are 60-second JWTs that the middleware
and `clerk-js` continuously refresh against Clerk's Frontend API, so anything
past a brief warm window fails without a connection.

Rather than branch every call site, a non-empty `NEXT_PUBLIC_OFFLINE_DEV_AUTH`
makes `next.config.ts` **alias** the two Clerk module specifiers to local stubs:

| Real module            | Stub (alias target)                                                       |
| ---------------------- | ------------------------------------------------------------------------- |
| `@clerk/nextjs/server` | `@bespoke/api/offlineDevClerk` — `packages/api/src/offlineDevClerk.ts`     |
| `@clerk/nextjs`        | `@bespoke/ui/OfflineDevClerk` — `packages/ui/src/OfflineDevClerk/index.tsx`|

This swaps `auth()`, `auth.protect()`, `clerkMiddleware`, `clerkClient()`,
`currentUser()`, and the client components (`<ClerkProvider>`, `<UserButton>`,
`<Show>`, `useClerk`, …) in one place — every consumer keeps importing Clerk
normally, and the production build is untouched. The fixed identity is defined at
the top of `packages/api/src/offlineDevClerk.ts`.

The one offline-aware piece of app code is the Clerk→local org resolver
(`getOrCreateLocalOrganisation`): when the flag names a local org id it
short-circuits straight to that org (in prod the flag is absent, so it's a no-op).

The aliases point at package subpaths rather than file paths because Turbopack's
`resolveAlias` only rewrites to bare module specifiers — a relative target would
resolve differently per importer (the consumers span `apps/bar` and
`packages/api`). The stubs therefore live in packages the bar app already
depends on, exposed via each package's existing `"./*"` export.

The flag is hard-disabled when `VERCEL=1`, so the stubs can never reach a
deployment even if the variable leaks into a Vercel environment.

## Keeping your existing local data

`NEXT_PUBLIC_OFFLINE_DEV_AUTH=1` bootstraps a fresh, empty sandbox org. To work
against data you already have locally, set the flag to that org's **local id**
(`organisations.id`, the value `auth.orgId` resolves to) instead of `1`:

```sql
SELECT id, name FROM organisations;
```

```
NEXT_PUBLIC_OFFLINE_DEV_AUTH=VdWY0A3hmB
```

If the id doesn't exist, the first page render throws a clear error rather than
silently creating a new org. Identity is independent of the org and still
defaults to a local stub user — override with `OFFLINE_DEV_AUTH_USER_ID` (e.g. to
match per-user favourites), `OFFLINE_DEV_AUTH_FIRST_NAME`,
`OFFLINE_DEV_AUTH_LAST_NAME`, `OFFLINE_DEV_AUTH_EMAIL`.

## What doesn't work offline

By design — these need their cloud services and aren't part of normal authoring:

- The Clerk account/org UI (sign-in, `<UserButton>`, organisation profile).
- `/admin` (also needs Vercel Edge Config).
- Billing (Stripe), photo OCR + recipe/ingredient enrichment (GCP), and
  Upstash-backed rate limiting.

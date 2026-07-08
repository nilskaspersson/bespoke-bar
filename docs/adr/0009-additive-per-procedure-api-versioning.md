# The tRPC contract evolves additively and versions per-procedure when forced, because a shipped iOS binary speaks a frozen wire format the server can't force-update

The core Next.js app exposes one tRPC router (`appRouter`) consumed by three callers:
server components, server actions, and — as of the **Expo** app — an iOS client over
HTTP. The first two deploy atomically with the server; the iOS binary does not. Once a
build is in the App Store and on a phone it speaks whatever wire shape it was compiled
against, for as long as that version survives in the wild (App Store review latency,
users who never update). tRPC's end-to-end types are a *build-time* guarantee: they
protect the new app's compile and the web, but a running phone re-validates nothing — it
sends and parses bytes. So the contract that matters at runtime is the wire shape, and
the server must stay compatible with every app version still in use.

We keep **one router** (no public/internal split — the iOS app is complementary, not its
own product) and evolve it under three rules:

1. **Additive-only by default.** New inputs are `.optional()` with a server default;
   output fields are append-only; a procedure a live app may still call is never removed.
   This is the same tolerant-reader discipline the **Reservoir** schema already follows
   (additive, no backfill), applied to the wire.
2. **Per-procedure successor when a change can't be additive.** The procedure gains a
   sibling (`recipe.listV2`) rather than mutating in place. New builds call the successor;
   old builds keep hitting the original until it is retired.
3. **Every client call carries `x-app-version` and `x-platform`,** from the first build.
   A server-set minimum-version floor, stored in **Edge Config** (`@vercel/edge-config`)
   so it changes without a deploy, returns "update required" below the floor. Raising the
   floor past a cohort is what makes it safe to delete that cohort's superseded
   procedures.

## Considered options

- **One global `v2` namespace per breaking change.** Clean for a wholesale redesign, but
  duplicates every unchanged procedure to break a single field; a complementary app
  evolves field-by-field, so the per-procedure successor is proportionate. A global `v2`
  can still be introduced later if a real redesign warrants it — committing to it now is
  the irreversible move, starting per-procedure is not.
- **Split mobile-facing and internal routers, disciplining only the former.** Lets
  web-only procedures churn freely, but adds a standing boundary to police for a
  single-developer, single-client surface. Deferred: the version floor plus telemetry
  give the same retirement power without the bookkeeping. Revisit if web and mobile needs
  diverge sharply.
- **Stripe-style dated versions (`x-api-version: <date>` + server transform chains).**
  The right tool for a large public API with many third-party consumers; pure overhead
  for one first-party client. Not adopted.
- **Additive-only with no version header.** Cheap until the first unavoidable break — at
  which point there is no way to identify or wall off old cohorts, and the header cannot
  be added retroactively to binaries already shipped. Rejected: the header is the one
  piece that must exist from day one even if nothing else does.

## Consequences

- A hard "update required" wall is an accepted product behaviour, reserved for security
  fixes and for retiring contracts the floor has passed — not a routine UX.
- Superseded procedures (`...V2`) accrete. Each is a small, explicit cost; the floor is
  the mechanism that lets them be deleted, so raising the floor should be a routine
  release step, not a rare event, or the surface grows without bound.
- **The "does mobile call this?" question precedes any non-additive change.** Because all
  three callers share one router, a breaking edit to a procedure the iOS app also calls
  requires a successor — even though the web and server-action callers would tolerate the
  edit (they deploy with the server).
- **Error codes are a third axis of the contract.** The `AppError` envelope (`appErrorSchema`
  and its `code` union) lives in `packages/schema` so mobile parses the same shape; new codes
  are additive-only, and a mobile-reachable handler needs a default branch from day one, since
  a shipped binary can't learn a new code.
- **Enforce additivity in CI, don't trust discipline.** Snapshot the router's input / output /
  error schemas and fail the build on any narrowing, removal, or new required field on a
  mobile-reachable procedure — the contract's equivalent of pnpm's boundary guardrail
  (ADR-0010).
- The min-version floor is keyed **per platform** — iOS and Android cohorts drift apart; one
  global floor would strand one store or under-protect the other.
- The API **origin** is frozen on the same logic: a shipped binary hardcodes
  `bar.bespoke-bar.app/api/trpc`, so the production domain must be settled before the first
  build (see the deployment plan).
- Day-one instrumentation is load-bearing: `x-app-version` / `x-platform` must ship in the
  very first TestFlight build, or the policy has a permanent blind spot for that cohort.
- The same append-only discipline extends to any on-device persistence: a payload cached
  by an old build is read by the new build after update, so persisted shapes follow the
  wire's rules and need a cache-buster when they can't. (Relevant only if offline storage
  lands; not yet decided.)

## Amendment — offline persistence decided (2026-07-05)

Offline storage (**Offline Reads**, CONTEXT.md) is landing, and the last consequence
resolves the *strict* way: the persisted query cache is keyed to the app binary version
(the persister's cache-buster), so **a new build never reads an old build's cache** and the
append-only discipline for persisted shapes is moot. Within one binary's lifetime the two
remaining directions are safe by construction: the server only evolves additively (a binary
cannot know fields newer than itself), and a per-procedure successor changes the query key,
which strands the old entry harmlessly. Accepted edge: the first launch after an app update
starts with an empty cache, so that launch is briefly library-less if it happens offline —
judged phantom, since updates arrive over the network moments earlier.

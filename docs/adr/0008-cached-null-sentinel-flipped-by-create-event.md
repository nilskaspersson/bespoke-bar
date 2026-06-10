# Organisation bootstrap caches a `null` sentinel and flips it with a create event, because a throw can't cross the `use cache` boundary in production

The clerkOrgId → localOrgId mapping (`getCachedLocalOrgId`) and the local **Organisation**
row (`getCachedOrganisation`) are both read through `"use cache"` functions. On the
first request for a newly-created Clerk org, no local row exists yet, so each read has
to represent "no row yet" somehow.

They return **`null`** — a cached negative — rather than throwing. The bootstrap path
(`createLocalOrganisation`) inserts the row and, in an `after()`, emits
`cacheEvents.organisation.create` to **flip the cached `null` to a hit on the next
request**.

The reason is a production-only Next.js/React behavior: a throw inside a `"use cache"`
function does **not** propagate cleanly through a user-land `try/catch` in a production
server-component render — React intercepts it and re-emits it as a wrapped render error
before the caller's `try/catch` ever sees it (it appears to work in dev, which largely
bypasses `"use cache"`). So "missing row" cannot be modelled as an exception across the
cache boundary; it has to be a cached *value* that an event later invalidates.

## Considered options

- **Throw on the missing row, catch in the caller to bootstrap.** The obvious shape,
  and it works in dev. In production React wraps the throw into a render error before
  the caller can catch it — a crash instead of a bootstrap. Rejected; this is the
  failure that forced the sentinel.
- **Don't cache the negative — an uncached existence check, then the cached read.**
  Avoids caching `null`, but adds a DB round-trip to the hottest path on every request
  and splits one read into two. The cached-`null` + create-event flip keeps it a single
  cached read.
- **Cache `null` but rely on a short TTL instead of the event.** Reintroduces churn and
  serves `null` for a window after the row exists. The `create` event flips exactly when
  the row appears.

## Consequences

- A cached `null` is a *valid, meaningful* state ("no local org yet"), distinct from an
  error. Callers branch on it (`getOrCreateLocalOrganisation`), never `try/catch` it.
- The flip depends on `organisation.create` firing from the bootstrap path; drop that
  emit and the cached `null` sticks for its `max` lifetime.
- **Do not "simplify" these reads to throw on a missing row.** It reintroduces a
  production-only render crash that dev will not reveal — the same dev-vs-prod blind
  spot that makes `"use cache"` behaviour hard to test (cf. ADR-0007).
- More generally: anywhere a `"use cache"` boundary sits between an existence check and
  its handler, "absent" must be a return value, not a throw.

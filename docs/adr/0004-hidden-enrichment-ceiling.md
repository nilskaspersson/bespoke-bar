# Enrichment is bounded by a hidden per-org Enrichment Ceiling on Upstash, separate from the OCR Quota

**Enrichment** calls a paid LLM fire-and-forget on every Recipe/Ingredient
create. The recipe-slot limit caps how many recipes an **Organisation** may
*have*, but not how many it may *create over time* — deleting frees slots — so a
create→delete→repeat loop could drive unbounded LLM spend. The **Enrichment
Ceiling** bounds it: a hidden, rolling 24-hour cap (1000 LLM-touched items) on an
Upstash sliding-window counter, keyed by org.

It is explicitly **not** the OCR **Quota**: invisible to users, no **Grants**,
no Pro bonus, and exceeding it silently skips the LLM rather than erroring.
Honest use peaks around a couple hundred LLM items per day (a full library built
entirely from new ingredients), so 1000 is invisible to real users; flash-lite
is cheap enough that even at the ceiling the cost is trivial — it exists to stop
the *unbounded* case, not to meter honest use. It shares the `rate-limit-enabled`
Edge Config kill switch with the request rate-limiter, so disabling limiting
during an incident stands all of it down together.

## Considered options

- **Mirror the OCR Quota** (a DB ledger like `ocr_quota_uses` + grants +
  `AppError`). That model exists for a user-facing, audited, grantable
  allowance; this ceiling is hidden and race-tolerant, so the ledger's machinery
  (table growth, retention, grants, exact accounting) is pure overhead. A Redis
  counter is also deletion-proof by construction — the abuse *is* deleting the
  rows, so the counter must live outside the entity tables.
- **Reuse the OCR Quota tables/terms.** Would conflate two distinct meters under
  one **Use**/**Quota** vocabulary and force a discriminator column. Kept
  separate.
- **Meter every enrichment attempt, not just LLM calls.** Would charge the free
  heuristic path against the ceiling, penalising the common zero-cost case. We
  meter only LLM-touched items.
- **Fail open on limiter error** (as `rateLimit` does). `rateLimit` fails open so
  a Redis hiccup never blocks a legitimate write. Here the guarded action is
  optional and the goal is protecting spend, so we fail **closed** — a
  configured limiter that errors denies the LLM. The kill switch, not an outage,
  is the intended way to disable it.

## Consequences

- Over-budget orgs get **Recipe Enrichment** degraded to heuristic-only (a free
  Style, no LLM); **Ingredient Enrichment** (which has no heuristic) simply
  pauses until budget returns.
- Because the ceiling meters LLM items, confidently-classified recipes cost
  nothing against it.
- With no Upstash configured (e.g. local dev) the check allows, unmetered — so
  **Enrichment** never depends on Redis being present.
- Flipping `rate-limit-enabled` off disables the request rate-limiter *and* the
  Enrichment Ceiling together; this is intentional, as both are Upstash-based
  limiting.
- A future per-org "enrichment usage" view would need its own persistent log;
  the sliding-window counter keeps no history (cf. `0001` for the OCR side).

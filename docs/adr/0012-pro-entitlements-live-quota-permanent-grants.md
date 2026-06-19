# Pro entitlements split: a live-computed quota bonus, permanently ledgered slot grants

Becoming Pro grants two *different kinds* of benefit, and they are stored
differently on purpose:

- The **OCR quota bonus** is **never stored**. The ceiling is computed at read
  time as `base + Σ ledger grants + (Pro active ? PRO_OCR_QUOTA_BONUS : 0)`
  (`getOCRQuotaLimit`). "Pro active" is read from the webhook-maintained
  subscription mirror (`org_subscriptions`), and `PRO_ACTIVE_STATUSES` is
  `["active"]` only. So the bonus exists exactly while the subscription does.
- The **slot rewards** *are* stored, as permanent rows in the
  `recipe_slot_grants` ledger: `PRO_SIGNUP_SLOT_BONUS` (+100, once ever) and
  `PRO_MONTHLY_SLOT_BONUS` (+5 per sustained month). They deliberately
  **survive cancellation** — they are rewards for having been Pro, not benefits
  of currently being Pro.

The rule behind the split: **a revocable entitlement is computed from live
state; a permanent one is written to the append-only ledger.** Computing the
revocable quota bonus means a dropped `customer.subscription.deleted` webhook
can never strand a permanent OCR allowance — the next ceiling read simply sees
the mirror is no longer active. Writing the permanent rewards to the ledger
means at-least-once webhook delivery is safe (idempotent), the grants are
auditable, and clawing one back is a compensating row, never a mutation. This
extends the recipe-slot-limits principle "subscription bonuses are NOT in the
ledger" to its corollary: *only* the non-revocable rewards are.

The mirror is a cache of Stripe truth, not the source of truth for permanent
entitlements; the ledger is. Both bonus constants live in
`src/features/billing/constants.ts`; the minting logic is
`proBonusGrantsFromSubscription` (`stripeWebhook.ts`), and the canonical writer
is `issueSlotGrant` / `clawBackSlotGrant`.

## Idempotency keys

`recipe_slot_grants.external_id` is unique-when-set, so the keys *are* the
business rules — `issueSlotGrant` no-ops on a duplicate:

- `pro-signup:<orgId>` — no date, so it is **once ever per org**. Re-minted on
  every active-status event (self-healing after an outage) but only the first
  lands; resubscribing never re-grants.
- `pro-month:<YYYY-MM>:<orgId>` — one grant per UTC calendar month, starting
  the month *after* the subscription was created (`created` month `<` now
  month). A new subscription restarts the clock, so cancel/resubscribe flapping
  accrues nothing; only sustained months do.
- `refund:<originalGrantId>` — a compensating **negative** grant
  (`source: "refund"`) on a full refund or withdrawn dispute. A refunded first
  invoice claws back `pro-signup`; the signup key stays once-ever even after
  clawback, so refund-then-resubscribe earns nothing.

## Considered options

- **Store the quota bonus as a ledger grant too** (uniform mechanism). Rejected:
  a missed cancellation webhook would leave a permanent OCR allowance, and
  clawing it back on every churn is fragile. Live computation makes the bonus
  self-correcting and lets cancellation propagate on the very next gate check.
- **Keep the slot rewards live (compute from "is/was Pro")** instead of
  ledgering. Rejected: they must survive cancellation and stack with one-off
  pack purchases, which is exactly what an additive permanent ledger already
  does; deriving "how many loyalty months has this org earned" from Stripe
  history on every read is more code and less auditable.
- **Gate Pro features on the price id / cohort.** Rejected: features gate on
  "is Pro active" (the mirror), so any active subscription unlocks them with no
  per-feature flagging. `price_id` is on the mirror if a founding cohort is ever
  needed.

## Consequences

- **Dunning gap is accepted.** `PRO_ACTIVE_STATUSES = ["active"]`, so a
  `past_due`/`unpaid` subscription loses the *quota* bonus until payment
  recovers. Bounded by the dashboard's retry window; adding `"past_due"` is a
  one-line grace if wanted. Permanent slot grants are unaffected.
- **A loyalty month can be missed across a webhook outage.** `pro-month` keys
  off the processing-time month with no backfill, so a calendar month with no
  processed subscription event is skipped permanently. Accepted: +5 against a
  50 base, framed as generosity, not core utility. The signup bonus does *not*
  have this exposure — its fixed key self-heals on the next event.
- **Refunds are honoured but abuse-safe.** Full refunds and withdrawn disputes
  claw back via negative ledger rows; a *won* dispute (`funds_reinstated`) is
  rare enough to restore manually. The ledger stays append-only throughout.
- **Cancellation is immediate for quota, permanent for slots** — the intended
  asymmetry, and the reason the two are stored differently.

# AI-enrichment marks clear on user change, diffed against the stored value — not on submitted emptiness

A Recipe/Ingredient field that **Enrichment** fills is recorded in
`ai_enriched_fields` and surfaced as **Auto-filled**. The mark must clear the
moment the user *changes* that field. Both edit forms are conform **full-snapshot**
submits — every field is re-sent at its stored value, including untouched ones
(selects emit a hidden input carrying the loaded value), so "did the user change
this field?" cannot be read from the submitted payload alone: an untouched
Auto-filled value arrives indistinguishable from a deliberate edit.

So clearing diffs each currently-marked field's submitted value against the
**stored** value and un-marks only those that differ. An unchanged passthrough —
or a deliberate re-save of the same value — keeps the mark; a real edit or a
clear-to-empty drops it. One shared helper implements this for both entities.

The earlier rule kept a mark only while the submitted value was *empty*. Since an
Auto-filled field holds a non-empty value, and the form re-submits it on any save,
that rule wiped every mark on the first save of any field — marks barely
persisted.

We accept the narrow async-enrichment race (a snapshot loaded before
fire-and-forget enrichment lands can blank a freshly-filled value on save) rather
than add optimistic-concurrency plumbing, consistent with the deliberately
race-tolerant enrichment posture (ADR-0004).

## Considered options

- **Trust the submitted payload** (un-mark any field whose submitted value is
  non-empty / present). Rejected: full-snapshot forms make every untouched
  Auto-filled field look edited, so this clears marks the user never touched.
- **Client-side dirty tracking** — the form sends which fields the user actually
  touched. More precise to intent, but requires both conform forms to track and
  transmit dirtiness; the server-side diff is simpler and authoritative.
- **Clear all marks on any save.** Simplest, but editing the recipe's name would
  strip the style/glassware marks the user never touched.

## Consequences

- Both edit paths must read the **stored values** of the marked fields. The recipe
  transaction path previously read only `ai_enriched_fields`; it now also selects
  the enrichable field values.
- A re-save of an unchanged value is a no-op for the mark.
- Clearing a field to empty counts as a change, so it un-marks — and the
  now-empty field is correctly no longer **Auto-filled**.
- The mark is recomputed server-side and is never trusted from client input; it is
  also omitted from the submittable schemas so it cannot be set by the client.

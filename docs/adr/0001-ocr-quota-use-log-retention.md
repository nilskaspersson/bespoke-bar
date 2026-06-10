# `ocr_quota_uses` is pruned opportunistically per-org, not on a schedule

Each row in `ocr_quota_uses` records a single **Use** for **Quota**
enforcement. The only consumer of those rows is the rolling-22h enforcement
query (`OCR_QUOTA_WINDOW_HOURS`); anything older than that is no longer
load-bearing. Each successful
**Photo-to-Recipe** call uses Next.js `after()` to delete rows older than 48
hours for that same org — bounding the working-set size *per active org*
without setting up a scheduled job. Dormant orgs keep their old rows
indefinitely; the table self-trims for active ones. There is no audit,
support, or analytics requirement for **Use** history beyond enforcement, so
nothing is lost.

## Considered options

- **No prune.** Postgres handles billion-row tables fine, but the
  decision to keep no history is an active one — leaving the log
  unbounded would not communicate that. A future engineer would assume
  the table is meant to grow.
- **Cron-based prune.** Cleanly separates writes from maintenance, but
  adds infra (Vercel Cron config, monitoring) for a problem already
  solved cheaply by `after()`. Revisit if the per-request prune ever
  proves insufficient.

## Consequences

- The prune emits **no cache event and needs none**. It only ever deletes rows
  already outside the rolling enforcement window, so no cached count
  (`cacheTags.ocrQuotaUsage`) can observe the delete. The cached projection is
  correct whether or not the prune ever runs — it is pure housekeeping to keep
  the table lean, not a load-bearing step. (This holds only while the window
  stays shorter than the 48h retention; they must not cross.)
- Refunds are only possible within the 48h window. Acceptable because
  the only refund case is "Vision failed, undo the Use" within the same
  request — bounded by seconds, not days.
- Dormant orgs keep their old rows until the next OCR call cleans them
  up. Storage cost is negligible.
- Adding the **Reservoir** mechanic later is unaffected: it would gain a
  separate ledger / drain table that does not share this retention
  policy.
- Any future "show me OCR usage history" feature would need a separate
  persistent log. We don't need that today.

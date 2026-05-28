/**
 * Length of the rolling Quota window.
 *
 * Deliberately under 24h. With an exact-24h window a daily power-user who maxes
 * out drifts later every day: each day's usage lands a little after the prior
 * unlock, and the next unlock anchors to that later time. A sub-day window
 * frees the oldest Use a couple of hours earlier each day, so the unlock keeps
 * pace with roughly-daily use instead of marching forward.
 *
 * Single source of truth for both the SQL window predicate (`getOCRUsageInWindow`,
 * used by the gate and the cached projection) and the client-facing
 * `nextAvailableAt` (`getOCRQuotaState`),
 * so the gate and the countdown can never disagree.
 */
export const OCR_QUOTA_WINDOW_HOURS = 22;
export const OCR_QUOTA_WINDOW_MS = OCR_QUOTA_WINDOW_HOURS * 60 * 60 * 1000;

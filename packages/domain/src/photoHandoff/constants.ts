/** How long a code stays scannable. */
export const HANDOFF_LINK_TTL_MS = 15 * 60_000;

/**
 * Extra time for a photo submitted right before expiry to finish processing
 * and be picked up.
 */
export const HANDOFF_RESULT_GRACE_MS = 2 * 60_000;

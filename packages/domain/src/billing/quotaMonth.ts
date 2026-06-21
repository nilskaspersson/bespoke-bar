/**
 * Calendar-month Quota boundaries, in UTC.
 *
 * Quota accounting is calendar-month ("3 per month, resets on the 1st") and
 * the boundary is UTC — matching the DB, whose sessions run UTC in every
 * deployed environment. Orgs carry no timezone, so a local-midnight reset
 * isn't representable; a fixed UTC boundary is predictable and matches what
 * enforcement does.
 */
export function startOfCurrentUTCMonthMs(nowMs: number): number {
	const now = new Date(nowMs);
	return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1);
}

export function startOfNextUTCMonthMs(nowMs: number): number {
	const now = new Date(nowMs);
	return Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1);
}

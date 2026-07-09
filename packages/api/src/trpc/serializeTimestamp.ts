export const TIMESTAMP_KEYS = new Set([
	"addedAt",
	"createdAt",
	"updatedAt",
	"featuredAt",
	"currentPeriodEnd",
]);

const CANONICAL_ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

/**
 * Timestamptz values reach the boundary in several shapes: the pg driver's
 * text output (`"YYYY-MM-DD HH:MM:SS.ssssss+00"`), PG's `to_json` form used
 * by drizzle relational-query nesting (`"YYYY-MM-DDTHH:MM:SS.ssssss+00:00"`),
 * pre-migration naive strings from warm caches (UTC wall time, zoneless, in
 * either space- or T-separated form), and already-canonical ISO. Normalize
 * everything to one canonical wire format — `toISOString()`'s
 * `YYYY-MM-DDTHH:MM:SS.sssZ` — since a frozen mobile contract (ADR-0013)
 * should carry exactly one shape. Zoneless values are stamped as the UTC
 * they were written as; null, empty (stitching's fallback ingredient), and
 * time-less strings pass through untouched.
 */
export function serializeTimestamp(value: string): string;
export function serializeTimestamp(value: string | null): string | null;
export function serializeTimestamp(value: string | null): string | null {
	if (!value || CANONICAL_ISO.test(value)) {
		return value;
	}
	const t = value.replace(" ", "T");
	const timeStart = t.indexOf("T");
	if (timeStart === -1 || !/^\d/.test(t[timeStart + 1] ?? "")) {
		return value;
	}
	const hasZone = /(?:Z|[+-]\d{2}(?::\d{2})?)$/.test(t.slice(timeStart));
	const parseable = hasZone ? t.replace(/([+-]\d{2})$/, "$1:00") : `${t}Z`;
	return new Date(parseable).toISOString();
}

/**
 * Deep variant for stitched output shapes (recipes with lines/tags, menus
 * with entries): walks arrays and plain objects, re-stamping every
 * createdAt/updatedAt/featuredAt it finds. Shape-preserving (string stays
 * string, null stays null), so the output type is the input type.
 */
export function serializeWireTimestamps<T>(value: T): T {
	if (Array.isArray(value)) {
		return value.map(serializeWireTimestamps) as T;
	}
	if (value === null || typeof value !== "object") {
		return value;
	}
	const out: Record<string, unknown> = {};
	for (const [key, entry] of Object.entries(value)) {
		out[key] =
			TIMESTAMP_KEYS.has(key) && (typeof entry === "string" || entry === null)
				? serializeTimestamp(entry as string | null)
				: serializeWireTimestamps(entry);
	}
	return out as T;
}

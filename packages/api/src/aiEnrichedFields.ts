import { isEmpty } from "@bespoke/domain/utils/collection";

/**
 * Two field values are "the same" when equal, treating every empty (null /
 * undefined / "") as one value, so a null↔"" round-trip through a form never
 * reads as an edit. Format-sensitive fields (e.g. a percentage the form rounds)
 * are normalised by the caller into the same space before comparing.
 */
function isUnchanged(stored: unknown, submitted: unknown): boolean {
	if (isEmpty(stored) && isEmpty(submitted)) {
		return true;
	}
	return stored === submitted;
}

/**
 * Recompute `ai_enriched_fields` after a user edit. A field keeps its Auto-filled
 * mark only while the user leaves its value unchanged; editing it (or clearing it)
 * drops the mark. Diffs each marked field against its STORED value — not submitted
 * emptiness — because the edit forms re-submit every field at its stored value, so
 * an untouched value is indistinguishable from a deliberate edit in the payload
 * alone (see ADR-0005). Returns null, not [], when nothing stays marked, so the
 * column is nulled rather than left an empty array.
 */
export function clearTouchedAiMarks<Field extends string>(
	markedFields: readonly Field[],
	stored: Partial<Record<Field, unknown>>,
	submitted: Partial<Record<Field, unknown>>,
): Field[] | null {
	const kept = markedFields.filter((field) =>
		isUnchanged(stored[field], submitted[field]),
	);
	return kept.length > 0 ? kept : null;
}

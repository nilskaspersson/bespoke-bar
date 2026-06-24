/**
 * Given what the user has typed so far and a candidate ingredient name,
 * return the ghost-text completion suffix — or null if no ghost should show.
 *
 * Rules:
 * - The ingredient name must start with the query (case-insensitive prefix match)
 * - The completion must not start with whitespace (signals a trimming mismatch)
 * - The completion must be non-empty (exact match → nothing to complete)
 */
export function getGhostCompletion(
	queryString: string,
	ingredientName: string,
): string | null {
	if (!ingredientName.toLowerCase().startsWith(queryString.toLowerCase())) {
		return null;
	}

	const completion = ingredientName.slice(queryString.length);

	if (completion.length === 0 || /^\s/.test(completion)) {
		return null;
	}

	return completion;
}

import { normalizeInput } from "@/utils";

/**
 * Build a search index that maps item keys to pre-normalized
 * searchable text. Fields are joined with null characters to
 * prevent false matches across field boundaries.
 */
export function createSearchIndex<T>(
	items: T[],
	getKey: (item: T) => string,
	getSearchableText: (item: T) => string[],
): Map<string, string> {
	return new Map(
		items.map((item) => [
			getKey(item),
			getSearchableText(item).map(normalizeInput).join("\0"),
		]),
	);
}

/**
 * Filter items using a pre-built search index.
 * Returns items whose indexed text contains the normalized query,
 * with prefix matches sorted before substring-only matches.
 */
export function searchByIndex<T>(
	items: T[],
	index: Map<string, string>,
	getKey: (item: T) => string,
	query: string,
): T[] {
	if (!query) return items;

	const q = normalizeInput(query);
	const prefixMatches: T[] = [];
	const substringMatches: T[] = [];

	for (const item of items) {
		const searchStr = index.get(getKey(item));
		if (!searchStr) continue;

		if (searchStr.startsWith(q)) {
			prefixMatches.push(item);
		} else if (searchStr.includes(q)) {
			substringMatches.push(item);
		}
	}

	return prefixMatches.concat(substringMatches);
}

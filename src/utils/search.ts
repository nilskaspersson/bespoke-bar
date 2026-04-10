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
 * Returns items whose indexed text contains the normalized query.
 */
export function searchByIndex<T>(
	items: T[],
	index: Map<string, string>,
	getKey: (item: T) => string,
	query: string,
): T[] {
	if (!query) return items;

	const q = normalizeInput(query);
	const result: T[] = [];

	for (const item of items) {
		if (index.get(getKey(item))?.includes(q)) {
			result.push(item);
		}
	}

	return result;
}

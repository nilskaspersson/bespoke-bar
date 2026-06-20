import { normalizeInput } from "@/utils";

declare const searchIndexBrand: unique symbol;

export type SearchIndex<T> = Map<string, string> & {
	readonly [searchIndexBrand]: T;
};

/**
 * Build a search index that maps item keys to pre-normalized
 * searchable text. Fields are joined with null characters to
 * prevent false matches across field boundaries.
 */
export function createSearchIndex<T>(
	items: T[],
	getKey: (item: T) => string,
	getSearchableText: (item: T) => string[],
): SearchIndex<T> {
	return new Map(
		items.map((item) => [
			getKey(item),
			getSearchableText(item).map(normalizeInput).join("\0"),
		]),
	) as SearchIndex<T>;
}

/**
 * Find an item whose indexed text equals the normalized query exactly.
 */
export function findExactByIndex<T>(
	items: T[],
	index: SearchIndex<T>,
	getKey: (item: T) => string,
	query: string,
): T | undefined {
	if (!query) return undefined;
	const q = normalizeInput(query);
	return items.find((item) => index.get(getKey(item)) === q);
}

/**
 * Filter items using a pre-built search index.
 * Returns items whose indexed text contains the normalized query,
 * with prefix matches sorted before substring-only matches.
 */
export function searchByIndex<T>(
	items: T[],
	index: SearchIndex<T>,
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

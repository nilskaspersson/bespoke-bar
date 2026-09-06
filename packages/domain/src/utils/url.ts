const PATTERN_NON_ALPHANUMERIC = /[^a-z0-9]+/g;
const PATTERN_LEADING_TRAILING_DASHES = /^-+|-+$/g;

/**
 * @param recipe { "name": "Corpse reviver #2", ... }
 * @returns "corpse-reviver-2"
 */
export function namedEntityToUrlSlug<T extends { name?: string | null }>(o: T) {
	return toUrlFriendlyString(o.name || "");
}

/**
 * @param input "Corpse reviver #2"
 * @returns "corpse-reviver-2"
 * @public
 */
export function toUrlFriendlyString(input: string) {
	return input
		.toLowerCase()
		.replace(PATTERN_NON_ALPHANUMERIC, "-")
		.replace(PATTERN_LEADING_TRAILING_DASHES, "");
}

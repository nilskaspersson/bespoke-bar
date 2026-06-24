/**
 * Unicode "Combining Diacritical Marks" block (U+0300 to U+036F).
 * Used to strip accents after NFKD normalization decomposes characters
 * like "é" into "e" + combining acute accent.
 */
const COMBINING_MARKS = /[\u0300-\u036f]/g;

const NON_ASCII = /\P{ASCII}/u;

/**
 * Fold a string to its ASCII-comparable form: strip diacritics and map typographic
 * punctuation (curly quotes, en/em dashes) to ASCII equivalents.
 */
export function asciiFold(s: string): string {
	// Fast path: skip normalize + regex if pure ASCII
	if (!NON_ASCII.test(s)) return s;

	return s
		.normalize("NFKD")
		.replaceAll(COMBINING_MARKS, "")
		.replaceAll(/[‘’‚‛′ʼ]/g, "'")
		.replaceAll(/[“”„‟]/g, '"')
		.replaceAll(/[–—]/g, "-");
}

export function normalizeInput(s: string): string {
	return asciiFold(s).toLowerCase().trim();
}

/**
 * Escapes special characters in a string for use in a regular expression.
 */
export function escapeRegex(string: string): string {
	return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

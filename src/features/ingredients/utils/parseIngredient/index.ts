import { pipe } from "@/utils";

// biome-ignore lint/suspicious/noControlCharactersInRegex: We look for control characters in order to remove them.
const CONTROL_CHARS_PATTERN = /[\x00-\x1F\x7F]/g;
const WHITESPACE_PATTERN = /\s+/g;

const sanitizeControlChars = (text: string): string =>
	CONTROL_CHARS_PATTERN.test(text)
		? text.replace(CONTROL_CHARS_PATTERN, "")
		: text;

const normalizeWhitespace = (text: string): string =>
	/\s{2,}/.test(text) ? text.replace(WHITESPACE_PATTERN, " ") : text;

const capitalizeFirst = (text: string): string =>
	text.charAt(0).toUpperCase() + text.slice(1);

const tranformIngredient = pipe(
	capitalizeFirst,
	normalizeWhitespace,
	sanitizeControlChars,
);

export function formatIngredient(userInput: string): string | null {
	const text = userInput.trim();

	if (!text) {
		return null;
	}

	return tranformIngredient(text);
}

export function ingredientTextParser(
	userInput: string,
): [string | null, string] {
	/**
	 * Return empty remainder, this is assumed to be the end of the input
	 */
	return [formatIngredient(userInput), ""];
}

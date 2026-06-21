// A numeric run, not followed by a slash. Captures grouping and decimal
// separators (`.`/`,`) so locale-formatted quantities copied off a RecipeCard
// (e.g. "4,5", "1.500,5") round-trip back through the editor; `parseLocaleNumber`
// disambiguates the separators.
const NUMBER_PATTERN = /^(\d+(?:[.,]\d+)*|[.,]\d+)(?!\s*\/)/;

// Slash-notation fractions (precomposed Unicode glyphs are decomposed to this form via NFKC)
const FRACTION_PATTERN = /^(\d+\s*\/\s*\d+)/;

/**
 * Resolve a numeric token that may use `.` or `,` for grouping and/or the decimal
 * point. We can't know the locale a copied line was formatted in (a user might
 * paste lines from anywhere) so we infer separator roles from a convention
 * formatted numbers broadly share rather than from a known locale:
 *
 * - the rightmost separator is the decimal point,
 * - unless it closes a 3-digit group on a >= 1000 integer; formatted quantities
 *   don't carry 3 decimal places, so a trailing run of exactly 3 digits reads as
 *   grouping, not precision (any other length stays decimal),
 * - a leading-zero integer (e.g. "0,125" = ⅛) is always a decimal.
 *
 * Everything left of the decimal point has its grouping separators stripped.
 */
function parseLocaleNumber(raw: string): number {
	const lastSeparator = Math.max(raw.lastIndexOf("."), raw.lastIndexOf(","));

	if (lastSeparator === -1) {
		return Number.parseFloat(raw);
	}

	const integerDigits = raw.slice(0, lastSeparator).replace(/[.,]/g, "");
	const trailing = raw.slice(lastSeparator + 1);

	const isGrouping =
		trailing.length === 3 && integerDigits !== "" && integerDigits !== "0";

	return Number.parseFloat(
		isGrouping
			? integerDigits + trailing
			: `${integerDigits || "0"}.${trailing}`,
	);
}

const tryParseFloat = (text: string): [number | null, string] => {
	const match = text.match(NUMBER_PATTERN);

	if (!match) {
		return [null, text];
	}

	/**
	 * Note: Best-effort guess
	 */
	const quantity = parseLocaleNumber(match[0]);

	return [quantity > 0 ? quantity : null, text.slice(match[0].length)];
};

const tryParseFraction = (text: string): [number | null, string] => {
	const match = text.match(FRACTION_PATTERN);

	if (!match) {
		return [null, text];
	}

	// Number() trims whitespace for us, e.g. "1 / 2" == "1/2"
	const [numerator, denominator] = match[0].split("/").map(Number);
	const quantity = numerator / denominator;

	return [quantity > 0 ? quantity : null, text.slice(match[0].length)];
};

/**
 * NFKC decomposes precomposed fraction glyphs (½, ¾, ⅓, …) into
 * `digit + U+2044 + digit`. The regex below then injects a space when
 * U+2044 sits between digits so the compact form `1½` parses as the
 * mixed number `1 1/2` rather than `11/2`. ASCII-only inputs skip the
 * normalize() call entirely.
 */
function hasNonAscii(text: string): boolean {
	for (let i = 0; i < text.length; i++) {
		if (text.charCodeAt(i) > 127) {
			return true;
		}
	}
	return false;
}

/**
 * Collapse a space-grouped integer at the start of the input (e.g. "1 500" or
 * "1 234 567" -> "1234567"). Plain ASCII spaces and the no-break variants that
 * locale formatters emit (U+00A0; U+202F for fr-*) are both treated as group
 * separators: a unit never starts with a digit, so a 3-digit run after the
 * quantity can only be grouping. Each group must be exactly 3 digits and end at
 * a decimal, space, or line end, which keeps mixed numbers ("1 3/4") and counts
 * ("2 cucumber") untouched. Runs before NFKC, which folds no-break spaces into
 * plain ones.
 */
const LEADING_GROUPED_NUMBER = /^\d{1,3}(?:[ \u00a0\u202f]\d{3})+(?=[.,]|\s|$)/;
const GROUP_SEPARATORS = /[ \u00a0\u202f]/g;

function normalize(userInput: string): string {
	const collapsed = userInput
		.trim()
		.replace(LEADING_GROUPED_NUMBER, (match) =>
			match.replace(GROUP_SEPARATORS, ""),
		);

	if (!hasNonAscii(collapsed)) {
		return collapsed;
	}

	return collapsed
		.normalize("NFKC")
		.replace(/(\d)⁄(\d)/g, " $1/$2")
		.trim();
}

export function formatQuantity(userInput: string): number | null {
	const [quantity] = quantityTextParser(userInput);
	return quantity;
}

export function quantityTextParser(userInput: string): [number | null, string] {
	const text = normalize(userInput);

	if (!text) {
		return [null, text];
	}

	const floatResult = tryParseFloat(text);

	if (floatResult[0] !== null) {
		/**
		 * Handle mixed numbers like "1 3/4" or "2 ½" by checking if a fraction
		 * follows the whole number.
		 */
		const fractionResult = tryParseFraction(floatResult[1].trimStart());

		if (fractionResult[0] !== null) {
			return [floatResult[0] + fractionResult[0], fractionResult[1]];
		}

		return floatResult;
	}

	return tryParseFraction(text);
}

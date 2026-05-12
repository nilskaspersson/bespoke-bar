// Floats, not followed by a slash
const FLOAT_PATTERN = /^(\d+\.?\d*|\.\d+)(?!\s*\/)/;

// Slash-notation fractions (precomposed Unicode glyphs are decomposed to this form via NFKC)
const FRACTION_PATTERN = /^(\d+\s*\/\s*\d+)/;

const tryParseFloat = (text: string): [number | null, string] => {
	const match = text.match(FLOAT_PATTERN);

	if (!match) {
		return [null, text];
	}

	const quantity = Number.parseFloat(match[0]);

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

function normalize(userInput: string): string {
	if (!hasNonAscii(userInput)) {
		return userInput.trim();
	}

	return userInput
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

import { FRACTION_MAP } from "@/features/quantity/constants";
import type { Parser } from "@/utils/sequencedParsers";

const FLOAT_PATTERN = /^(\d+\.?\d*|\.\d+)(?!\s*\/)/;
const FRACTION_PATTERN = /^([½¼¾⅓⅔⅛⅜⅝⅞]|\d+\s*\/\s*\d+)/;

export const parseQuantity: Parser<number | null> = (userInput: string) => {
	const text = userInput.trim();

	if (!text) {
		return [null, text];
	}

	let match: RegExpMatchArray | null;

	// Fast path: Floats, not followed by a slash
	match = text.match(FLOAT_PATTERN);

	if (match) {
		const remainder = text.slice(match[0].length);
		return [parseFloat(match[0]), remainder];
	}

	// Slow path: Fractions, with fractional characters or manual slash notation
	match = text.match(FRACTION_PATTERN);

	if (match) {
		let quantity: number | undefined;

		if (match[0].includes("/")) {
			/**
			 * Number() trims any whitespace for us in, "1 / 2" == "1/2"
			 */
			const [numerator, denominator] = match[0].split("/").map(Number);
			quantity = numerator / denominator;
		} else {
			quantity = FRACTION_MAP.get(match[0]);
		}

		const remainder = text.slice(match[0].length);
		return [quantity ?? null, remainder];
	}

	return [null, text];
};

import { FRACTION_MAP } from "@/features/quantity/constants";

// Floats, not followed by a slash
const FLOAT_PATTERN = /^(\d+\.?\d*|\.\d+)(?!\s*\/)/;

// Fractional characters or manual slash notation
const FRACTION_PATTERN = /^([½¼¾⅓⅔⅛⅜⅝⅞]|\d+\s*\/\s*\d+)/;

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

	let quantity: number;

	if (match[0].includes("/")) {
		// Number() trims whitespace for us, e.g. "1 / 2" == "1/2"
		const [numerator, denominator] = match[0].split("/").map(Number);
		quantity = numerator / denominator;
	} else {
		quantity = FRACTION_MAP.get(match[0]) ?? 0;
	}

	return [quantity > 0 ? quantity : null, text.slice(match[0].length)];
};

export function formatQuantity(userInput: string): number | null {
	const [quantity] = quantityTextParser(userInput);
	return quantity;
}

export function quantityTextParser(userInput: string): [number | null, string] {
	const text = userInput.trim();

	if (!text) {
		return [null, text];
	}

	const floatResult = tryParseFloat(text);

	if (floatResult[0] !== null) {
		return floatResult;
	}

	return tryParseFraction(text);
}

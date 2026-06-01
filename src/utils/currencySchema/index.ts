import z from "zod";

const CURRENCY_PATTERN = /[^0-9.-]/g;

/**
 * Parses a currency input string to a number, preserving the entered precision.
 * Rounding is intentionally not done here: Intl handles per-currency display
 * rounding, and the authoritative snap to a currency's minor unit belongs at the
 * charging boundary.
 */
export const currencySchema = z.preprocess(
	(v) => {
		if (typeof v !== "string") {
			return v;
		}

		const cleaned = v.replace(CURRENCY_PATTERN, "");
		const num = parseFloat(cleaned);
		return Number.isNaN(num) ? v : num;
	},
	z
		.number()
		.min(0, "Price must be positive")
		.max(99999999.9999, "Price too large"),
);

import z from "zod/v4";

const CURRENCY_PATTERN = /[^0-9.-]/g;

export const currencySchema = z.preprocess(
	(v) => {
		if (typeof v !== "string") {
			return v;
		}

		const cleaned = v.replace(CURRENCY_PATTERN, "");
		const num = parseFloat(cleaned);
		return Number.isNaN(num) ? v : Number(num.toFixed(2));
	},
	z
		.number()
		.min(0, "Price must be positive")
		.max(99999999.99, "Price too large"),
);

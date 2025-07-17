import { z } from "zod/v4";

const PATTERN_GLOBAL_PERCENTAGE = /%/g;
const PATTERN_INT_INPUT = /^\d{1,3}$/;
const PATTERN_NUMERIC_INPUT = /^(\d+\.?\d*|\.\d+)$/;

export const percentageToRatioSchema = z
	.union([z.string(), z.number(), z.null(), z.undefined()])
	.transform((input, ctx) => {
		if (!input && input !== 0) {
			return null;
		}

		if (typeof input === "number") {
			if (input >= 0 && input <= 1) {
				return input;
			}

			ctx.addIssue({
				code: "custom",
				message: "Percentage must be between 0 and 100",
				input,
			});

			return z.NEVER;
		}

		if (typeof input !== "string") {
			return null;
		}

		const text = input.replace(PATTERN_GLOBAL_PERCENTAGE, "").trim();

		if (text === "") {
			return null;
		}

		/**
		 * The majority of input will be integers, let's use that as a fast path.
		 */
		if (PATTERN_INT_INPUT.test(text)) {
			const num = parseInt(text, 10);

			if (num > 100) {
				ctx.addIssue({
					code: "custom",
					message: "Percentage must be between 0 and 100",
					input,
				});

				return z.NEVER;
			}

			return num / 100;
		}

		if (!PATTERN_NUMERIC_INPUT.test(text)) {
			ctx.addIssue({
				code: "custom",
				message: "Must be a valid percentage format (e.g., 40, 37.5%, 12.25%)",
				input,
			});

			return z.NEVER;
		}

		const parsed = parseFloat(text);

		if (Number.isNaN(parsed) || parsed < 0 || parsed > 100) {
			ctx.addIssue({
				code: "custom",
				message: "Percentage must be between 0 and 100",
				input,
			});

			return z.NEVER;
		}

		return Math.round((parsed / 100) * 10000) / 10000;
	})
	.pipe(z.number().min(0).max(1).nullable());

const PATTERN_INT_INPUT = /^\d{1,3}$/;
const PATTERN_NUMERIC_INPUT = /^(\d+\.?\d*|\.\d+)$/;

export function percentageToRatio(userInput: string | null): number | null {
	if (!userInput || typeof userInput !== "string") {
		return null;
	}

	const text = userInput.replace(/%/g, "").trim();

	if (text === "") {
		return null;
	}

	/**
	 * The majority of input will be integers, let's use that as a fast path.
	 */
	if (PATTERN_INT_INPUT.test(text)) {
		const num = parseInt(text, 10);
		return num <= 100 ? num / 100 : null;
	}

	if (!PATTERN_NUMERIC_INPUT.test(text)) {
		return null;
	}

	const parsed = parseFloat(text);

	if (Number.isNaN(parsed) || parsed < 0 || parsed > 100) {
		return null;
	}

	return Math.round((parsed / 100) * 10000) / 10000;
}

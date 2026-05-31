import { describe, expect, test } from "vitest";
import { formatRetryAfter, getAppErrorToast } from "./appError";

describe("formatRetryAfter", () => {
	test("renders sub-minute durations in seconds", () => {
		expect(formatRetryAfter(1)).toBe("1 second");
		expect(formatRetryAfter(30)).toBe("30 seconds");
		expect(formatRetryAfter(59)).toBe("59 seconds");
	});

	test("floors to one second so a countdown never shows zero", () => {
		expect(formatRetryAfter(0)).toBe("1 second");
	});

	test("renders minute durations", () => {
		expect(formatRetryAfter(60)).toBe("1 minute");
		expect(formatRetryAfter(90)).toBe("2 minutes");
	});

	test("renders hour durations", () => {
		expect(formatRetryAfter(3600)).toBe("1 hour");
		expect(formatRetryAfter(7200)).toBe("2 hours");
	});
});

describe("getAppErrorToast OCR_QUOTA_REACHED", () => {
	test("uses domain language and the unlock countdown", () => {
		const toast = getAppErrorToast({
			code: "OCR_QUOTA_REACHED",
			limit: 3,
			used: 3,
			retryAfter: 3600,
		});

		expect(toast.message).toBe("Photo-to-Recipe quota reached");
		expect(toast.description).toBe(
			"You've used all 3 of your Photo-to-Recipe uses. The next one unlocks in 1 hour.",
		);
	});
});

describe("getAppErrorToast RECIPE_SPEC_LIMIT_REACHED", () => {
	test("names the offending recipe when known", () => {
		const toast = getAppErrorToast({
			code: "RECIPE_SPEC_LIMIT_REACHED",
			limit: 20,
			recipeName: "Negroni",
		});

		expect(toast.message).toBe("Too many ingredients");
		expect(toast.description).toBe(
			'"Negroni" can have at most 20 ingredients.',
		);
	});

	test("falls back to a generic subject without a name", () => {
		const toast = getAppErrorToast({
			code: "RECIPE_SPEC_LIMIT_REACHED",
			limit: 20,
		});

		expect(toast.description).toBe("A Recipe can have at most 20 ingredients.");
	});
});

describe("getAppErrorToast NO_RECIPE_FOUND", () => {
	test("uses domain language and notes the Use was still spent", () => {
		const toast = getAppErrorToast({ code: "NO_RECIPE_FOUND" });

		expect(toast.message).toBe("No recipe found");
		expect(toast.description).toBe(
			"We couldn't read a recipe from the provided image. Try another photo.",
		);
	});
});

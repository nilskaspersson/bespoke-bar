import { describe, expect, it } from "vitest";
import { clearTouchedAiMarks } from "./aiEnrichedFields";

describe("clearTouchedAiMarks", () => {
	it("keeps unchanged marks and drops the changed ones", () => {
		expect(
			clearTouchedAiMarks(
				["category", "abv", "description"],
				{ category: "spirit", abv: 0.4, description: "Juniper-forward" },
				{ category: "spirit", abv: 0.45, description: "Juniper-forward" },
			),
		).toEqual(["category", "description"]);
	});

	it("compares numbers by value, so an unchanged abv keeps its mark", () => {
		expect(clearTouchedAiMarks(["abv"], { abv: 0.4 }, { abv: 0.4 })).toEqual([
			"abv",
		]);
	});

	it("still drops the abv mark on a genuine change", () => {
		expect(
			clearTouchedAiMarks(["abv"], { abv: 0.4 }, { abv: 0.45 }),
		).toBeNull();
	});

	it("treats null, undefined and '' as the same empty value", () => {
		expect(
			clearTouchedAiMarks(["brand"], { brand: null }, { brand: "" }),
		).toEqual(["brand"]);
	});

	it("drops a mark when its value is cleared to empty", () => {
		expect(
			clearTouchedAiMarks(["brand"], { brand: "Acme" }, { brand: "" }),
		).toBeNull();
	});

	it("ignores submitted fields that are not marked", () => {
		const submitted = { category: "spirit", abv: 0.5 };
		expect(
			clearTouchedAiMarks(["category"], { category: "spirit" }, submitted),
		).toEqual(["category"]);
	});

	it("returns null, not an empty array, when nothing survives", () => {
		expect(
			clearTouchedAiMarks(
				["category"],
				{ category: "spirit" },
				{ category: "liqueur" },
			),
		).toBeNull();
	});
});

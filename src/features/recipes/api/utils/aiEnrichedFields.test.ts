import { describe, expect, it } from "vitest";
import { clearTouchedAiMarks } from "./aiEnrichedFields";

describe("clearTouchedAiMarks (recipe)", () => {
	it("keeps a mark when the form re-submits the unchanged stored value", () => {
		expect(
			clearTouchedAiMarks(
				["style", "glassware"],
				{ style: "sour", glassware: "coupe" },
				{ style: "sour", glassware: "coupe" },
			),
		).toEqual(["style", "glassware"]);
	});

	it("drops only the mark for the field the user actually changed", () => {
		expect(
			clearTouchedAiMarks(
				["style", "glassware"],
				{ style: "sour", glassware: "coupe" },
				{ style: "fizz", glassware: "coupe" },
			),
		).toEqual(["glassware"]);
	});

	it("drops a mark when the user clears the field to empty", () => {
		expect(
			clearTouchedAiMarks(["style"], { style: "sour" }, { style: "" }),
		).toBeNull();
	});

	it("does not read a null↔'' round-trip as a change", () => {
		expect(
			clearTouchedAiMarks(
				["style", "glassware"],
				{ style: null, glassware: "coupe" },
				{ style: "", glassware: "coupe" },
			),
		).toEqual(["style", "glassware"]);
	});

	it("returns null when no mark survives", () => {
		expect(
			clearTouchedAiMarks(["style"], { style: "sour" }, { style: "martini" }),
		).toBeNull();
	});

	it("treats a null/absent stored mark array as no marks", () => {
		expect(clearTouchedAiMarks(null, {}, { style: "sour" })).toBeNull();
		expect(clearTouchedAiMarks(undefined, {}, {})).toBeNull();
	});

	it("treats an unparseable stored mark array as no marks rather than throwing", () => {
		expect(clearTouchedAiMarks(["bogus-legacy-key"], {}, {})).toBeNull();
	});
});

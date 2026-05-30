import { describe, expect, it } from "vitest";
import { clearTouchedAiMarks } from "./aiEnrichedFields";

describe("clearTouchedAiMarks", () => {
	it("drops a mark once the user provides a value for that field", () => {
		expect(
			clearTouchedAiMarks(["style", "glassware"], { style: "sour" }),
		).toEqual(["glassware"]);
	});

	it("keeps marks for fields the user left empty (null/undefined/blank)", () => {
		expect(
			clearTouchedAiMarks(["style", "glassware", "preparationMethod"], {
				style: null,
				preparationMethod: undefined,
			}),
		).toEqual(["style", "glassware", "preparationMethod"]);
	});

	it("returns null when nothing stays flagged", () => {
		expect(clearTouchedAiMarks(["style"], { style: "martini" })).toBeNull();
	});

	it("treats a null/absent stored value as no marks", () => {
		expect(clearTouchedAiMarks(null, { style: "sour" })).toBeNull();
		expect(clearTouchedAiMarks(undefined, {})).toBeNull();
	});

	it("treats an unparseable stored array as no marks rather than throwing", () => {
		expect(clearTouchedAiMarks(["bogus-legacy-key"], {})).toBeNull();
	});
});

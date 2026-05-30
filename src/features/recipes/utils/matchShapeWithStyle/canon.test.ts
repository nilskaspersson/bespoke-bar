import { describe, expect, it } from "vitest";
import { matchShapeWithStyle } from "./";
import { CANON, type CanonCase, toRecipe } from "./canon.fixture";

const styleOf = (c: CanonCase) => matchShapeWithStyle(toRecipe(c)).style;

describe("canon — structural classification (categories known)", () => {
	// The unambiguous classics: these are the regression contract. Drinks whose
	// bucket is genuinely arguable are flagged `debatable` and reported, not
	// asserted (see canon.fixture.ts).
	it.each(CANON.filter((c) => !c.debatable))("$name → $expected", (c) => {
		expect(styleOf(c)).toBe(c.expected);
	});

	it("never emits the 'other' style", () => {
		for (const c of CANON) {
			expect(styleOf(c)).not.toBe("other");
		}
	});

	// The spirit-forward stirred family splits three ways on its modifiers:
	// Campari → negroni, brown base → manhattan, otherwise martini.
	it("splits the spirit-forward family into martini / manhattan / negroni", () => {
		const styleByName = (name: string) => {
			const c = CANON.find((x) => x.name === name);
			if (!c) throw new Error(`canon missing ${name}`);
			return styleOf(c);
		};
		expect(styleByName("Dry Martini")).toBe("martini");
		expect(styleByName("Manhattan")).toBe("manhattan");
		expect(styleByName("Negroni")).toBe("negroni");
		for (const c of CANON.filter((x) => x.family === "manhattan")) {
			expect(styleOf(c)).toBe("manhattan");
		}
	});
});

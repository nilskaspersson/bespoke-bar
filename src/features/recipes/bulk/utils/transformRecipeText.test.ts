import { describe, expect, test } from "vitest";
import { capitalizeLine, convertLine, roundLine } from "./transformRecipeText";

describe("capitalizeLine", () => {
	test("capitalizes a recipe name", () => {
		expect(capitalizeLine("old fashioned")).toBe("Old Fashioned");
	});

	test("capitalizes ingredient portion only", () => {
		expect(capitalizeLine("2 oz lime juice")).toBe("2 oz Lime Juice");
	});

	test("preserves quantity and unit", () => {
		expect(capitalizeLine("1.5 cl simple syrup")).toBe("1.5 cl Simple Syrup");
	});

	test("does not touch quantity numbers or unit words", () => {
		expect(capitalizeLine("3 cl gin")).toBe("3 cl Gin");
		expect(capitalizeLine("2 dashes angostura bitters")).toBe(
			"2 dashes Angostura Bitters",
		);
	});

	test("returns line unchanged if no ingredient", () => {
		expect(capitalizeLine("2 oz")).toBe("2 oz");
	});

	test("handles empty line", () => {
		expect(capitalizeLine("")).toBe("");
	});

	test("handles whitespace-only line", () => {
		expect(capitalizeLine("   ")).toBe("   ");
	});

	test("preserves list prefix", () => {
		expect(capitalizeLine("- old fashioned")).toBe("- Old Fashioned");
	});

	test("preserves leading whitespace", () => {
		expect(capitalizeLine("  2 oz lime juice")).toBe("  2 oz Lime Juice");
	});

	test("is idempotent on already-capitalized input", () => {
		expect(capitalizeLine("Old Fashioned")).toBe("Old Fashioned");
		expect(capitalizeLine("2 oz Lime Juice")).toBe("2 oz Lime Juice");
	});
});

describe("convertLine", () => {
	test("converts cl to fl oz (metric to imperial)", () => {
		const result = convertLine("3 cl gin", "imperial");
		expect(result).toContain("fl oz");
		expect(result).toContain("gin");
	});

	test("converts fl oz to cl (imperial to metric)", () => {
		const result = convertLine("1 fl oz lime juice", "metric");
		expect(result).toContain("cl");
		expect(result).toContain("lime juice");
	});

	test("returns line unchanged if no unit", () => {
		expect(convertLine("Negroni", "metric")).toBe("Negroni");
	});

	test("returns line unchanged if already in target system", () => {
		const result = convertLine("3 cl gin", "metric");
		expect(result).toContain("cl");
	});

	test("handles empty line", () => {
		expect(convertLine("", "metric")).toBe("");
	});

	test("preserves list prefix", () => {
		const result = convertLine("- 3 cl gin", "imperial");
		expect(result).toMatch(/^- /);
		expect(result).toContain("gin");
	});

	test("converts every line of a multi-spec recipe independently", () => {
		const lines = ["3 cl gin", "3 cl campari", "3 cl sweet vermouth"];
		const converted = lines.map((line) => convertLine(line, "imperial"));

		for (const line of converted) {
			expect(line).toContain("fl oz");
			expect(line).not.toContain("cl");
		}
		expect(converted[0]).toContain("gin");
		expect(converted[1]).toContain("campari");
		expect(converted[2]).toContain("sweet vermouth");
	});

	test("does not mutate recipe name lines mixed with spec lines", () => {
		const lines = ["Negroni", "3 cl gin", "3 cl campari"];
		const converted = lines.map((line) => convertLine(line, "imperial"));
		expect(converted[0]).toBe("Negroni");
		expect(converted[1]).toContain("fl oz");
		expect(converted[2]).toContain("fl oz");
	});
});

describe("roundLine", () => {
	test("rounds a quantity to a snapped value", () => {
		const result = roundLine("2.33 cl gin");
		expect(result).toContain("gin");
		expect(result).not.toContain("2.33");
	});

	test("returns line unchanged if no unit", () => {
		expect(roundLine("Daiquiri")).toBe("Daiquiri");
	});

	test("handles empty line", () => {
		expect(roundLine("")).toBe("");
	});

	test("rounds every line of a multi-spec recipe independently", () => {
		const lines = ["2.33 cl gin", "1.1 cl campari", "0.7 cl vermouth"];
		const rounded = lines.map(roundLine);
		for (const original of lines) {
			const i = lines.indexOf(original);
			expect(rounded[i]).not.toBe(original);
		}
	});
});

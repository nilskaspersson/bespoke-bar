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
});

describe("roundLine", () => {
	test("rounds a quantity to a snapped value", () => {
		const result = roundLine("2.33 cl gin");
		expect(result).toContain("gin");
		// Should round to a clean value
		expect(result).not.toContain("2.33");
	});

	test("returns line unchanged if no unit", () => {
		expect(roundLine("Daiquiri")).toBe("Daiquiri");
	});

	test("handles empty line", () => {
		expect(roundLine("")).toBe("");
	});
});

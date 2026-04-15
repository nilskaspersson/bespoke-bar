import { describe, expect, test } from "vitest";
import { unitTextParser } from "./parseUnit";

describe("unitTextParser", () => {
	describe("common units (fast path)", () => {
		test("cl", () => {
			expect(unitTextParser("cl Lime")).toEqual(["cl", "Lime"]);
		});

		test("oz", () => {
			expect(unitTextParser("oz Gin")).toEqual(["fl_oz", "Gin"]);
		});

		test("fl oz (multi-word)", () => {
			expect(unitTextParser("fl oz Vodka")).toEqual(["fl_oz", "Vodka"]);
		});
	});

	describe("uncommon units (slow path)", () => {
		test("ml", () => {
			expect(unitTextParser("ml Lime")).toEqual(["ml", "Lime"]);
		});

		test("tsp", () => {
			expect(unitTextParser("tsp Sugar")).toEqual(["tsp", "Sugar"]);
		});

		test("tbsp", () => {
			expect(unitTextParser("tbsp Honey")).toEqual(["tbsp", "Honey"]);
		});

		test("cup", () => {
			expect(unitTextParser("cup Ice")).toEqual(["cup", "Ice"]);
		});

		test("dash (bartending)", () => {
			expect(unitTextParser("dash Angostura")).toEqual(["dash", "Angostura"]);
		});

		test("barspoon (bartending)", () => {
			expect(unitTextParser("barspoon Absinthe")).toEqual([
				"barspoon",
				"Absinthe",
			]);
		});

		test("spray (bartending)", () => {
			expect(unitTextParser("spray Absinthe")).toEqual(["spray", "Absinthe"]);
		});
	});

	describe("aliases", () => {
		test("plural: cls → cl", () => {
			expect(unitTextParser("cls Lime")?.[0]).toBe("cl");
		});

		test("plural: dashes → dash", () => {
			expect(unitTextParser("dashes Bitters")?.[0]).toBe("dash");
		});

		test("long form: centiliter → cl", () => {
			expect(unitTextParser("centiliter Lime")?.[0]).toBe("cl");
		});

		test("long form: fluid ounces → fl_oz", () => {
			expect(unitTextParser("fluid ounces Gin")?.[0]).toBe("fl_oz");
		});

		test("dot notation: oz. → fl_oz", () => {
			expect(unitTextParser("oz. Gin")?.[0]).toBe("fl_oz");
		});

		test("dot notation: fl.oz. → fl_oz", () => {
			expect(unitTextParser("fl.oz. Gin")?.[0]).toBe("fl_oz");
		});

		test("bar spoon (two words) → barspoon", () => {
			expect(unitTextParser("bar spoon Absinthe")?.[0]).toBe("barspoon");
		});

		test("bsp → barspoon", () => {
			expect(unitTextParser("bsp Absinthe")?.[0]).toBe("barspoon");
		});

		test("wash → rinse", () => {
			expect(unitTextParser("wash Absinthe")?.[0]).toBe("rinse");
		});

		test("mist → spray", () => {
			expect(unitTextParser("mist Absinthe")?.[0]).toBe("spray");
		});
	});

	describe("case insensitivity", () => {
		test("CL", () => {
			expect(unitTextParser("CL Lime")?.[0]).toBe("cl");
		});

		test("Cl", () => {
			expect(unitTextParser("Cl Lime")?.[0]).toBe("cl");
		});

		test("FL OZ", () => {
			expect(unitTextParser("FL OZ Gin")?.[0]).toBe("fl_oz");
		});

		test("Dash", () => {
			expect(unitTextParser("Dash Bitters")?.[0]).toBe("dash");
		});
	});

	describe("word boundary", () => {
		test("does not match 'claiming' as 'cl'", () => {
			expect(unitTextParser("claiming Lime")).toEqual([null, "claiming Lime"]);
		});

		test("does not match 'mlk' as 'ml'", () => {
			expect(unitTextParser("mlk")).toEqual([null, "mlk"]);
		});

		test("matches unit at end of string", () => {
			expect(unitTextParser("cl")).toEqual(["cl", ""]);
		});
	});

	describe("remainder trimming", () => {
		test("trims whitespace from remainder", () => {
			expect(unitTextParser("cl   Sipsmith Gin")).toEqual([
				"cl",
				"Sipsmith Gin",
			]);
		});

		test("trims leading whitespace from input", () => {
			expect(unitTextParser("  cl Lime")).toEqual(["cl", "Lime"]);
		});

		test("unit only, no remainder", () => {
			expect(unitTextParser("ml")).toEqual(["ml", ""]);
		});
	});

	describe("no match", () => {
		test("empty string", () => {
			expect(unitTextParser("")).toEqual([null, ""]);
		});

		test("whitespace only", () => {
			expect(unitTextParser("   ")).toEqual([null, ""]);
		});

		test("unknown text", () => {
			expect(unitTextParser("xyz Lime")).toEqual([null, "xyz Lime"]);
		});

		test("ingredient name is not a unit", () => {
			expect(unitTextParser("Sipsmith Gin")).toEqual([null, "Sipsmith Gin"]);
		});
	});
});

import { describe, expect, it } from "vitest";
import type { SystemCategory } from "@/db/schema/categories";
import type { PreparationMethod } from "@/db/schema/preparationMethods";
import type { Unit } from "@/db/schema/units";
import { getRecipeShape, matchShapeWithStyle, type ShapeRecipe } from "./";

type SpecInit = {
	name?: string;
	category?: SystemCategory;
	optional?: boolean;
	quantity?: number;
	unit?: Unit;
};

function recipe(
	specs: SpecInit[],
	preparationMethod?: PreparationMethod,
): ShapeRecipe {
	return {
		preparationMethod,
		specs: specs.map((s) => ({
			optional: s.optional,
			quantity: s.quantity ?? null,
			unit: s.unit ?? null,
			ingredient: { name: s.name, category: s.category ?? null },
		})),
	};
}

/** Spec with a volume in ml, for the ratio-aware tests. */
function ml(
	category: SystemCategory,
	quantity: number,
	name: string = category,
): SpecInit {
	return { category, name, quantity, unit: "ml" };
}

const styleOf = (specs: SpecInit[], prep?: PreparationMethod) =>
	matchShapeWithStyle(recipe(specs, prep)).style;

describe("matchShapeWithStyle — by ingredient name (category not yet enriched)", () => {
	it("classifies a Daiquiri as a sour", () => {
		expect(
			styleOf([
				{ name: "White rum" },
				{ name: "Lime juice" },
				{ name: "Simple syrup" },
			]),
		).toBe("sour");
	});

	it("classifies a Margarita as a sour (liqueur is the sweet agent)", () => {
		expect(
			styleOf([
				{ name: "Tequila" },
				{ name: "Lime juice" },
				{ name: "Triple sec" },
			]),
		).toBe("sour");
	});

	it("classifies a Sidecar as a sour (no syrup, liqueur sweetens)", () => {
		expect(
			styleOf([
				{ name: "Cognac" },
				{ name: "Cointreau" },
				{ name: "Lemon juice" },
			]),
		).toBe("sour");
	});

	it("classifies a Gin Fizz as a fizz", () => {
		expect(
			styleOf([
				{ name: "Gin" },
				{ name: "Lemon juice" },
				{ name: "Simple syrup" },
				{ name: "Soda water" },
			]),
		).toBe("fizz");
	});

	it("classifies a Manhattan as manhattan (brown base + vermouth)", () => {
		expect(
			styleOf([
				{ name: "Rye whiskey" },
				{ name: "Sweet vermouth" },
				{ name: "Angostura bitters" },
			]),
		).toBe("manhattan");
	});

	it("classifies a dry Martini as martini-family", () => {
		expect(styleOf([{ name: "Gin" }, { name: "Dry vermouth" }])).toBe(
			"martini",
		);
	});

	it("classifies a Negroni as negroni (Campari via supplemental hint)", () => {
		expect(
			styleOf([
				{ name: "Gin" },
				{ name: "Sweet vermouth" },
				{ name: "Campari" },
			]),
		).toBe("negroni");
	});

	it("classifies an Aperol Spritz as a spritz", () => {
		expect(
			styleOf([
				{ name: "Aperol" },
				{ name: "Prosecco" },
				{ name: "Soda water" },
			]),
		).toBe("spritz");
	});

	it("classifies a Whiskey Smash as a smash (mint via supplemental hint)", () => {
		expect(
			styleOf([
				{ name: "Bourbon" },
				{ name: "Lemon juice" },
				{ name: "Fresh mint" },
				{ name: "Simple syrup" },
			]),
		).toBe("smash");
	});

	it("classifies a Gin & Tonic as a highball (tonic via supplemental hint)", () => {
		expect(styleOf([{ name: "Gin" }, { name: "Tonic water" }])).toBe(
			"highball",
		);
	});
});

describe("matchShapeWithStyle — by stored category (post-enrichment / existing ingredients)", () => {
	it("classifies an Old Fashioned (bitters, no citrus, no vermouth)", () => {
		expect(
			styleOf([
				{ name: "Bourbon", category: "bourbon" },
				{ name: "Demerara syrup", category: "syrup" },
				{ name: "Angostura", category: "cocktail_bitters" },
			]),
		).toBe("oldFashioned");
	});

	it("classifies a Whiskey Flip (whole egg, no citrus)", () => {
		expect(
			styleOf([
				{ name: "Rye", category: "rye" },
				{ name: "Whole egg", category: "egg" },
				{ name: "Simple syrup", category: "syrup" },
			]),
		).toBe("flip");
	});

	it("classifies a Mint Julep (herb, no citrus)", () => {
		expect(
			styleOf([
				{ name: "Bourbon", category: "bourbon" },
				{ name: "Mint", category: "herb" },
				{ name: "Simple syrup", category: "syrup" },
			]),
		).toBe("julep");
	});

	it("a whiskey sour with egg white stays a sour, not a flip", () => {
		expect(
			styleOf([
				{ name: "Bourbon", category: "bourbon" },
				{ name: "Lemon", category: "citrus" },
				{ name: "Simple", category: "syrup" },
				{ name: "Egg white", category: "egg" },
			]),
		).toBe("sour");
	});

	it("a Moscow Mule is a highball (citrus allowed, nothing sweet)", () => {
		expect(
			styleOf([
				{ name: "Vodka", category: "vodka" },
				{ name: "Lime", category: "citrus" },
				{ name: "Ginger beer", category: "soda" },
			]),
		).toBe("highball");
	});
});

describe("matchShapeWithStyle — abstains (left to the LLM)", () => {
	it("abstains on an Espresso Martini (no citrus, no vermouth)", () => {
		expect(
			styleOf([
				{ name: "Vodka", category: "vodka" },
				{ name: "Coffee liqueur", category: "liqueur" },
				{ name: "Espresso", category: "other" },
			]),
		).toBeNull();
	});

	it("abstains on a Piña Colada (blended, dairy + fruit, no citrus)", () => {
		expect(
			styleOf(
				[
					{ name: "Rum", category: "rum" },
					{ name: "Coconut cream", category: "dairy" },
					{ name: "Pineapple juice", category: "juice" },
				],
				"blended",
			),
		).toBeNull();
	});

	it("abstains on a neat spirit", () => {
		expect(styleOf([{ name: "Mezcal", category: "mezcal" }])).toBeNull();
	});

	it("abstains on an empty / unrecognized recipe", () => {
		expect(styleOf([])).toBeNull();
		expect(styleOf([{ name: "Mystery house ingredient" }])).toBeNull();
	});
});

describe("matchShapeWithStyle — confidence", () => {
	it("assigns higher confidence to sharp signatures than to highballs", () => {
		const oldFashioned = matchShapeWithStyle(
			recipe([
				{ category: "bourbon" },
				{ category: "syrup" },
				{ category: "cocktail_bitters" },
			]),
		);
		const highball = matchShapeWithStyle(
			recipe([{ category: "gin" }, { category: "soda" }]),
		);

		expect(oldFashioned.confidence).toBeGreaterThan(highball.confidence);
		expect(highball.confidence).toBeLessThan(0.7);
	});

	it("abstaining returns zero confidence and a null rule", () => {
		const result = matchShapeWithStyle(recipe([{ category: "vodka" }]));
		expect(result.style).toBeNull();
		expect(result.confidence).toBe(0);
		expect(result.rule).toBeNull();
	});
});

describe("getRecipeShape", () => {
	it("excludes optional specs (e.g. a garnish) from the shape", () => {
		const shape = getRecipeShape(
			recipe([
				{ category: "gin" },
				{ category: "citrus" },
				{ category: "syrup" },
				{ category: "herb", optional: true },
			]),
		);
		expect(shape.coreSpecCount).toBe(3);
		expect(shape.roleCounts.herb).toBeUndefined();
	});

	it("counts multiple base spirits (tiki-leaning builds)", () => {
		const shape = getRecipeShape(
			recipe([
				{ category: "rum" },
				{ category: "rum" },
				{ category: "citrus" },
			]),
		);
		expect(shape.spiritCount).toBe(2);
	});

	it("falls back from name to category and ignores unresolved ingredients", () => {
		const shape = getRecipeShape(
			recipe([{ name: "Gin" }, { name: "Mystery house ingredient" }]),
		);
		expect(shape.roleCounts.spirit).toBe(1);
		expect(shape.coreSpecCount).toBe(1);
	});

	it("computes per-role volumes, counting unitless specs as presence only", () => {
		const shape = getRecipeShape(
			recipe([
				ml("gin", 45),
				ml("citrus", 22.5),
				// no unit → contributes presence but no measured volume
				{ category: "egg", name: "Egg white", quantity: 1 },
			]),
		);
		expect(shape.hasVolumeData).toBe(true);
		expect(shape.totalVolume).toBeCloseTo(67.5);
		expect(shape.volumeByRole.spirit).toBeCloseTo(45);
		expect(shape.volumeByRole.egg ?? 0).toBe(0);
		expect(shape.roleCounts.egg).toBe(1);
	});
});

describe("matchShapeWithStyle — ratio awareness", () => {
	it("ignores an accent of citrus in a stirred, spirit-forward drink", () => {
		// Manhattan with a tiny lemon spec: citrus share is below threshold, so it
		// stays a Manhattan rather than becoming a sour.
		const result = matchShapeWithStyle(
			recipe([
				ml("rye", 60),
				ml("vermouth", 30),
				ml("citrus", 2),
				{ category: "cocktail_bitters", quantity: 2, unit: "dash" },
			]),
		);
		expect(result.style).toBe("manhattan");
	});

	it("treats a real citrus pour as a sour component", () => {
		expect(
			matchShapeWithStyle(
				recipe([ml("gin", 45), ml("citrus", 22), ml("syrup", 22)]),
			).style,
		).toBe("sour");
	});

	it("classifies a Last Word (equal parts) as a sour and flags equal-parts", () => {
		const result = matchShapeWithStyle(
			recipe([
				ml("gin", 22, "Gin"),
				ml("herbal_liqueur", 22, "Green Chartreuse"),
				ml("liqueur", 22, "Maraschino"),
				ml("citrus", 22, "Lime juice"),
			]),
		);
		expect(result.style).toBe("sour");
		expect(result.shape.equalParts).toBe(true);
	});

	it("classifies a Paper Plane (equal parts, bittersweet) as a sour", () => {
		expect(
			matchShapeWithStyle(
				recipe([
					ml("bourbon", 22, "Bourbon"),
					ml("aperitif", 22, "Aperol"),
					ml("amaro", 22, "Amaro Nonino"),
					ml("citrus", 22, "Lemon juice"),
				]),
			).style,
		).toBe("sour");
	});

	it("classifies a Trinidad Sour (bitters-dominant by volume) as a sour", () => {
		expect(
			matchShapeWithStyle(
				recipe([
					ml("cocktail_bitters", 45, "Angostura bitters"),
					ml("syrup", 22, "Orgeat"),
					ml("citrus", 22, "Lemon juice"),
					ml("rye", 15, "Rye whiskey"),
				]),
			).style,
		).toBe("sour");
	});

	it("classifies an equal-parts Negroni as negroni", () => {
		const result = matchShapeWithStyle(
			recipe([
				ml("gin", 30, "Gin"),
				ml("vermouth", 30, "Sweet vermouth"),
				ml("aperitif", 30, "Campari"),
			]),
		);
		expect(result.style).toBe("negroni");
		expect(result.shape.equalParts).toBe(true);
	});

	it("requires the mixer to dominate for a highball", () => {
		expect(
			matchShapeWithStyle(recipe([ml("gin", 45), ml("soda", 120)])).style,
		).toBe("highball");
		// A measured splash of soda over a spirit is not a highball.
		expect(
			matchShapeWithStyle(recipe([ml("gin", 60), ml("soda", 5)])).style,
		).toBeNull();
	});

	it("treats an unquantified 'top up with soda' as the dominant mixer", () => {
		// "60ml gin, top up with soda" — the soda carries no measured volume.
		expect(
			matchShapeWithStyle(
				recipe([ml("gin", 60), { name: "Soda", category: "soda" }]),
			).style,
		).toBe("highball");
	});
});

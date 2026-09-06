import type { BaseRecipe } from "@bespoke/schema/schema/recipes";
import { describe, expect, it } from "vitest";
import { aggregateIngredientTotals } from "./aggregateIngredientTotals";

type Line = NonNullable<BaseRecipe["lines"]>[number];

function recipe(lines: Omit<Line, "id">[]): BaseRecipe {
	return {
		lines: lines.map((line, index) => ({ ...line, id: String(index) })),
	};
}

describe("aggregateIngredientTotals", () => {
	it("returns nothing for no recipes", () => {
		expect(aggregateIngredientTotals([])).toEqual({
			ingredients: [],
			totalVolumeInMl: 0,
		});
	});

	it("sums one ingredient across recipes", () => {
		const { ingredients } = aggregateIngredientTotals([
			recipe([{ quantity: 6, unit: "cl", ingredient: { name: "Bourbon" } }]),
			recipe([{ quantity: 4, unit: "cl", ingredient: { name: "Bourbon" } }]),
		]);

		expect(ingredients).toHaveLength(1);
		expect(ingredients[0]).toMatchObject({
			name: "Bourbon",
			quantity: 10,
			unit: "cl",
			recipeCount: 2,
		});
	});

	it("matches ingredients by normalized name and keeps the first spelling", () => {
		const { ingredients } = aggregateIngredientTotals([
			recipe([
				{ quantity: 2, unit: "cl", ingredient: { name: "Lemon juice" } },
			]),
			recipe([
				{ quantity: 2, unit: "cl", ingredient: { name: " lemon JUICE " } },
			]),
		]);

		expect(ingredients).toHaveLength(1);
		expect(ingredients[0]?.name).toBe("Lemon juice");
		expect(ingredients[0]?.quantity).toBe(4);
	});

	it("converts later lines into the first measured unit", () => {
		const { ingredients } = aggregateIngredientTotals([
			recipe([{ quantity: 6, unit: "cl", ingredient: { name: "Gin" } }]),
			recipe([{ quantity: 30, unit: "ml", ingredient: { name: "Gin" } }]),
		]);

		expect(ingredients[0]?.unit).toBe("cl");
		expect(ingredients[0]?.quantity).toBeCloseTo(9);
		expect(ingredients[0]?.volumeInMl).toBeCloseTo(90);
	});

	it("counts an unmeasured line without giving it an amount", () => {
		const { ingredients } = aggregateIngredientTotals([
			recipe([
				{ quantity: 6, unit: "cl", ingredient: { name: "Bourbon" } },
				{ ingredient: { name: "Soda water" } },
			]),
		]);

		const soda = ingredients.find(({ name }) => name === "Soda water");

		expect(soda).toMatchObject({ quantity: null, unit: null, recipeCount: 1 });
		expect(ingredients.at(-1)).toBe(soda);
	});

	it("counts a unitless quantity instead of dropping it", () => {
		const { ingredients, totalVolumeInMl } = aggregateIngredientTotals([
			recipe([{ quantity: 1, ingredient: { name: "Cocktail cherry" } }]),
			recipe([{ quantity: 2, ingredient: { name: "Cocktail cherry" } }]),
		]);

		expect(ingredients[0]).toMatchObject({
			name: "Cocktail cherry",
			quantity: 3,
			unit: null,
			volumeInMl: 0,
			recipeCount: 2,
		});
		expect(totalVolumeInMl).toBe(0);
	});

	it("lets a measured line take over from a bare count", () => {
		const { ingredients } = aggregateIngredientTotals([
			recipe([{ quantity: 2, ingredient: { name: "Lime" } }]),
			recipe([{ quantity: 3, unit: "cl", ingredient: { name: "Lime" } }]),
		]);

		expect(ingredients[0]).toMatchObject({ quantity: 3, unit: "cl" });
	});

	it("marks an ingredient optional only when every line is", () => {
		const { ingredients } = aggregateIngredientTotals([
			recipe([
				{
					quantity: 1,
					unit: "dash",
					optional: true,
					ingredient: { name: "Absinthe" },
				},
				{
					quantity: 1,
					unit: "dash",
					optional: true,
					ingredient: { name: "Orange bitters" },
				},
			]),
			recipe([
				{ quantity: 2, unit: "dash", ingredient: { name: "Orange bitters" } },
			]),
		]);

		expect(ingredients.find(({ name }) => name === "Absinthe")?.optional).toBe(
			true,
		);
		expect(
			ingredients.find(({ name }) => name === "Orange bitters")?.optional,
		).toBe(false);
	});

	it("orders measured ingredients by volume and totals the batch", () => {
		const { ingredients, totalVolumeInMl } = aggregateIngredientTotals([
			recipe([
				{ quantity: 1.5, unit: "cl", ingredient: { name: "Simple syrup" } },
				{ quantity: 6, unit: "cl", ingredient: { name: "Bourbon" } },
				{ quantity: 3, unit: "cl", ingredient: { name: "Lemon juice" } },
			]),
		]);

		expect(ingredients.map(({ name }) => name)).toEqual([
			"Bourbon",
			"Lemon juice",
			"Simple syrup",
		]);
		expect(totalVolumeInMl).toBeCloseTo(105);
	});
});

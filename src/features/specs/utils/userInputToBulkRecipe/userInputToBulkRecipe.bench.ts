import { bench, describe } from "vitest";
import type { Ingredient } from "@/db/schema/ingredients";
import { userInputToBulkRecipe } from ".";

function makeIngredients(count: number): Ingredient[] {
	return Array.from({ length: count }, (_, i) => ({
		id: `id_${i}`,
		name: `Ingredient ${i}`,
		category: null,
		description: null,
		abv: null,
		brand: null,
		unitCost: null,
		measurementType: "volume" as const,
		orgId: "org_test",
		createdAt: "",
		updatedAt: "",
		createdBy: "",
		updatedBy: "",
		aiEnrichedFields: null,
	}));
}

function makeInput(recipeCount: number): string {
	return Array.from({ length: recipeCount }, (_, i) => {
		const base = i * 3;
		return [
			`Recipe ${i}`,
			`3 cl Ingredient ${base}`,
			`2 oz Ingredient ${base + 1}`,
			`1 dash Ingredient ${base + 2}`,
		].join("\n");
	}).join("\n\n");
}

const SIZES = [50, 200, 500];

for (const size of SIZES) {
	const ingredients = makeIngredients(size);
	const input5 = makeInput(5);
	const input20 = makeInput(20);

	describe(`userInputToBulkRecipe — ${size} ingredients`, () => {
		bench("5 recipes (20 lines)", () => {
			userInputToBulkRecipe(input5, ingredients);
		});

		bench("20 recipes (80 lines)", () => {
			userInputToBulkRecipe(input20, ingredients);
		});
	});
}

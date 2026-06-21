import type { Ingredient } from "@bespoke/schema/schema/ingredients";
import { bench, describe } from "vitest";
import {
	buildIngredientIndex,
	type IngredientIndex,
} from "../ingredients/buildIngredientIndex";
import { tokenizeLine } from "./tokenizeLine";

/**
 * Generate a realistic ingredient list of a given size.
 */
function makeIngredients(count: number): Ingredient[] {
	return Array.from({ length: count }, (_, i) => ({
		id: `id_${i}`,
		name: `Ingredient ${i}`,
		normalizedName: `ingredient ${i}`,
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

/**
 * Simulates the old O(n) lookup — find() per ingredient per call.
 */
function tokenizeLineWithFind(
	line: string,
	ingredients: Ingredient[],
): ReturnType<typeof tokenizeLine> {
	const slowIndex = {
		get(key: string) {
			return ingredients.find((i) => i.name.toLowerCase() === key);
		},
	} as unknown as IngredientIndex;
	return tokenizeLine(line, slowIndex);
}

const RECIPE_TEXT = [
	"Negroni",
	"3 cl Ingredient 0",
	"3 cl Ingredient 100",
	"3 cl Ingredient 499",
	"",
	"Gimlet",
	"5 cl Ingredient 250",
	"3 cl Ingredient 10",
	"2.5 cl Ingredient 450",
];

const SIZES = [50, 200, 500];

for (const size of SIZES) {
	const ingredients = makeIngredients(size);
	const index = buildIngredientIndex(ingredients);

	describe(`tokenizeLine × ${RECIPE_TEXT.length} lines — ${size} ingredients`, () => {
		bench("Map lookup (current)", () => {
			for (const line of RECIPE_TEXT) {
				tokenizeLine(line, index);
			}
		});

		bench("Array.find() per call (old)", () => {
			for (const line of RECIPE_TEXT) {
				tokenizeLineWithFind(line, ingredients);
			}
		});
	});
}

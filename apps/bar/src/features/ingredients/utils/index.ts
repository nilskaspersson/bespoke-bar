import type { Ingredient } from "@bespoke/schema/schema/ingredients";

export const getIngredientId = (ingredient: Ingredient): string =>
	ingredient.id;

export function getIngredientUrl(ingredient: Partial<Ingredient>): string {
	if (!ingredient.id) {
		throw new Error("Ingredient ID is required");
	}

	return `/bar/ingredients/${ingredient.id}`;
}

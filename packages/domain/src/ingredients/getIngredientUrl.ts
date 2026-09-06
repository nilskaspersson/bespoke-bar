import type { Ingredient } from "@bespoke/schema/schema/ingredients";

export function getIngredientUrl(ingredient: Partial<Ingredient>): string {
	if (!ingredient.id) {
		throw new Error("Ingredient ID is required");
	}

	return `/ingredients/${ingredient.id}`;
}

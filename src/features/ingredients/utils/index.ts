import type { Ingredient } from "@/db/schema/ingredients";

export function getIngredientUrl(ingredient: Partial<Ingredient>): string {
	if (!ingredient.id) {
		throw new Error("Ingredient ID is required");
	}

	return `/bar/ingredients/${ingredient.id}`;
}

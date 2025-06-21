import type { Ingredient } from "@/db/schema/ingredients";

export function getIngredientUrl(ingredient: Ingredient) {
	return `/bar/ingredients/${ingredient.id}`;
}

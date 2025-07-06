import type { RecipeWithSpecs } from "@/db/schema/recipes";

export function getRecipesUsingIngredient(
	ingredientId: string,
	recipes: RecipeWithSpecs[],
) {
	return recipes.filter((recipe) =>
		recipe.specs.some((spec) => spec.ingredientId === ingredientId),
	);
}

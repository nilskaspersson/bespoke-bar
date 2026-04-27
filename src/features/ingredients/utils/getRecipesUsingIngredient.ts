import type { RecipeWithSpecs } from "@/db/schema/recipes";

export function getRecipesUsingIngredient<T extends RecipeWithSpecs>(
	ingredientId: string,
	recipes: T[],
): T[] {
	return recipes.filter((recipe) =>
		recipe.specs.some((spec) => spec.ingredientId === ingredientId),
	);
}

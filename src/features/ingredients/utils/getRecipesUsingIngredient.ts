import type { RecipeWithLines } from "@/db/schema/recipes";

export function getRecipesUsingIngredient<T extends RecipeWithLines>(
	ingredientId: string,
	recipes: T[],
): T[] {
	return recipes.filter((recipe) =>
		recipe.lines.some((line) => line.ingredientId === ingredientId),
	);
}

import type { RecipeWithSpecs } from "@/db/schema/recipes";
import { DEFAULT_RECIPE_NAME } from "@/features/recipes/constants";
import { normalizeInput } from "@/utils";

export function createRecipeSearchIndex(
	recipes: RecipeWithSpecs[] | undefined,
): Map<string, string> {
	if (!recipes) {
		return new Map();
	}

	/**
	 * Create a map of recipe IDs, to a string of the recipe name and all ingredients,
	 * delimited by a null character. This enables fast substring matching without
	 * word overlap.
	 */
	return new Map(
		recipes.map((recipe) => [
			recipe.id,
			[
				normalizeInput(recipe.name ?? DEFAULT_RECIPE_NAME),
				...recipe.specs.map((spec) => normalizeInput(spec.ingredient.name)),
			].join("\0"),
		]),
	);
}

export function filterRecipes(
	recipes: RecipeWithSpecs[] | undefined,
	index: Map<string, string>,
	query: string,
): RecipeWithSpecs[] {
	if (!query || !recipes) {
		return recipes ?? [];
	}

	const q = normalizeInput(query);
	const result: RecipeWithSpecs[] = [];

	for (let i = 0; i < recipes.length; i++) {
		const recipe = recipes[i];
		const searchStr = index.get(recipe.id);

		if (searchStr?.includes(q)) {
			result.push(recipe);
		}
	}

	return result;
}

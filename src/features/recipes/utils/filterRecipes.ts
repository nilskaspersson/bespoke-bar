import type { RecipeWithSpecs } from "@/db/schema/recipes";
import { DEFAULT_RECIPE_NAME } from "@/features/recipes/constants";
import { normalizeInput } from "@/utils";

export type RecipeSearchIndex = Map<
	string,
	{
		normalizedName: string;
		normalizedIngredients: string[];
	}
>;

export function createRecipeSearchIndex(
	recipes: RecipeWithSpecs[] | undefined,
): RecipeSearchIndex {
	if (!recipes) return new Map();

	return new Map(
		recipes.map((recipe) => [
			recipe.id,
			{
				normalizedName: normalizeInput(recipe.name ?? DEFAULT_RECIPE_NAME),
				normalizedIngredients: recipe.specs.map((spec) =>
					normalizeInput(spec.ingredient.name),
				),
			},
		]),
	);
}

export function filterRecipes(
	recipes: RecipeWithSpecs[] | undefined,
	index: RecipeSearchIndex,
	query: string,
): RecipeWithSpecs[] {
	if (!query || !recipes) {
		return recipes ?? [];
	}

	const q = normalizeInput(query);

	return recipes.filter((recipe) => {
		const entry = index.get(recipe.id);
		if (!entry) return false;

		return (
			entry.normalizedName.includes(q) ||
			entry.normalizedIngredients.some((ing) => ing.includes(q))
		);
	});
}

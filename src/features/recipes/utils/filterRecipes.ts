import type { RecipeWithSpecs } from "@/db/schema/recipes";
import { DEFAULT_RECIPE_NAME } from "@/features/recipes/constants";
import { normalizeInput } from "@/utils";

export function filterRecipes(
	recipes: RecipeWithSpecs[] | undefined,
	query: string,
): RecipeWithSpecs[] {
	if (!query || !recipes) {
		return recipes ?? [];
	}

	const normalizedInput = normalizeInput(query);

	return recipes.filter((recipe) => {
		if (
			normalizeInput(recipe.name ?? DEFAULT_RECIPE_NAME).includes(
				normalizedInput,
			)
		) {
			return true;
		}

		return recipe.specs.some((spec) =>
			normalizeInput(spec.ingredient.name).includes(normalizedInput),
		);
	});
}

import type { RecipeWithSpecs } from "@/db/schema/recipes";
import { DEFAULT_RECIPE_NAME } from "@/features/recipes/constants";
import { createSearchIndex, searchByIndex } from "@/utils/search";

const getRecipeId = (recipe: RecipeWithSpecs) => recipe.id;

function getRecipeSearchFields(recipe: RecipeWithSpecs): string[] {
	return [
		recipe.name ?? DEFAULT_RECIPE_NAME,
		...recipe.specs.map((spec) => spec.ingredient.name),
	];
}

export function createRecipeSearchIndex(
	recipes: RecipeWithSpecs[] | undefined,
): Map<string, string> {
	if (!recipes) return new Map();
	return createSearchIndex(recipes, getRecipeId, getRecipeSearchFields);
}

export function filterRecipes(
	recipes: RecipeWithSpecs[] | undefined,
	index: Map<string, string>,
	query: string,
): RecipeWithSpecs[] {
	if (!recipes) return [];
	return searchByIndex(recipes, index, getRecipeId, query);
}

import type { BaseRecipe, Recipe, RecipeWithSpecs } from "@/db/schema/recipes";
import { DEFAULT_RECIPE_NAME } from "@/features/recipes/constants";
import { emptySpecs } from "@/features/specs/utils";
import { isObject } from "@/utils";
import { namedEntityToUrlSlug } from "@/utils/url";

export function getRecipeUrl(recipe: Recipe) {
	return `/bar/recipes/${recipe.id}/${namedEntityToUrlSlug(recipe)}`;
}

export function isEmptyDraftRecipe(recipe: BaseRecipe) {
	return !recipe.name && emptySpecs(recipe.specs);
}

export function isRecipe(o: unknown): o is Recipe {
	return (
		isObject(o) && Object.hasOwn(o, "id") && Object.hasOwn(o, "instructions")
	);
}

export function isRecipeWithSpecs(o: unknown): o is RecipeWithSpecs {
	return isObject(o) && Object.hasOwn(o, "specs");
}

export function getRecipeName(recipe: Recipe) {
	return recipe.name || DEFAULT_RECIPE_NAME;
}

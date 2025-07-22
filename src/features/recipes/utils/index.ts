import type { BaseRecipe, Recipe } from "@/db/schema/recipes";
import { emptySpecs } from "@/features/specs/utils";
import { namedEntityToUrlSlug } from "@/utils/url";

export function getRecipeUrl(recipe: Recipe) {
	return `/bar/recipes/${recipe.id}/${namedEntityToUrlSlug(recipe)}`;
}

export function isEmptyDraftRecipe(recipe: BaseRecipe) {
	return !recipe.name && emptySpecs(recipe.specs);
}

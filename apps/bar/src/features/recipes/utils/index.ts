import type {
	BaseRecipe,
	Recipe,
	RecipeWithLines,
} from "@bespoke/schema/schema/recipes";
import { hasNoLines } from "@/features/ingredientLines/utils";
import { DEFAULT_RECIPE_NAME } from "@/features/recipes/constants";
import { isObject } from "@/utils";
import { namedEntityToUrlSlug } from "@/utils/url";

export function getRecipeUrl(recipe: Recipe) {
	return `/recipes/${recipe.id}/${namedEntityToUrlSlug(recipe)}`;
}

export function isEmptyDraftRecipe(recipe: BaseRecipe) {
	return !recipe.name && hasNoLines(recipe.lines);
}

export function isRecipe(o: unknown): o is Recipe {
	return (
		isObject(o) && Object.hasOwn(o, "id") && Object.hasOwn(o, "instructions")
	);
}

export function isRecipeWithLines(o: unknown): o is RecipeWithLines {
	return isObject(o) && Object.hasOwn(o, "lines");
}

export function getRecipeName(recipe: Recipe) {
	return recipe.name || DEFAULT_RECIPE_NAME;
}

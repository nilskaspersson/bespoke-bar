import type { Recipe } from "@bespoke/schema/schema/recipes";
import { namedEntityToUrlSlug } from "../utils/url";

export function getRecipeUrl(recipe: Recipe) {
	return `/recipes/${recipe.id}/${namedEntityToUrlSlug(recipe)}`;
}

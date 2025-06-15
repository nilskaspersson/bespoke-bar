import type { Recipe } from "@/db/schema/recipes";

const PATTERN_NON_ALPHANUMERIC = /[^a-z0-9]+/g;
const PATTERN_LEADING_TRAILING_DASHES = /^-+|-+$/g;

/**
 * @param recipe { "name": "Corpse reviver #2", ... }
 * @returns "corpse-reviver-2"
 */
export const recipeToUrlSlug = (recipe: Pick<Recipe, "name">) =>
	toUrlFriendlyString(recipe.name || "");

/**
 * @param input "Corpse reviver #2"
 * @returns "corpse-reviver-2"
 */
export const toUrlFriendlyString = (input: string) =>
	input
		.toLowerCase()
		.replace(PATTERN_NON_ALPHANUMERIC, "-")
		.replace(PATTERN_LEADING_TRAILING_DASHES, "");

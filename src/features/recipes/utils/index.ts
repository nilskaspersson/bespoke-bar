import type { BaseRecipe, Recipe } from "@/db/schema/recipes";
import { emptySpecs } from "@/features/specs/utils";
import { recipeToUrlSlug } from "@/utils/url";

const PATTERN_URL_FRIENDLY_SLUG = /^[a-zA-Z0-9_-]+$/;

export function isValidRecipeParams(
	id: string | undefined,
	slug?: string[],
): boolean {
	if (!id || !PATTERN_URL_FRIENDLY_SLUG.test(id)) {
		return false;
	}

	/**
	 * Slug is optional to enable human-readable URLs, but with Next.js, the only
	 * optional segment pattern is a catch-all.
	 */
	if (!slug || slug.length === 0) {
		return true;
	}

	return slug.every((segment) => PATTERN_URL_FRIENDLY_SLUG.test(segment));
}

export function getRecipeUrl(recipe: Recipe) {
	return `/bar/recipes/${recipe.id}/${recipeToUrlSlug(recipe)}`;
}

export function isEmptyDraftRecipe(recipe: BaseRecipe) {
	return !recipe.name && emptySpecs(recipe.specs);
}

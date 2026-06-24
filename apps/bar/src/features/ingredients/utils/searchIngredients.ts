import type { Ingredient } from "@bespoke/schema/schema/ingredients";
import { CATEGORY_TO_LABEL } from "@/features/ingredients/constants";
import { normalizeInput } from "@/utils";
import { createSearchIndex, type SearchIndex } from "@/utils/search";

const getIngredientId = (ingredient: Ingredient) => ingredient.id;

function getIngredientSearchFields(ingredient: Ingredient): string[] {
	const categoryLabel = ingredient.category
		? CATEGORY_TO_LABEL.get(ingredient.category)
		: undefined;

	return [ingredient.name, ingredient.brand, categoryLabel].filter(
		(field): field is string => Boolean(field),
	);
}

export function createIngredientSearchIndex(
	ingredients: Ingredient[],
): SearchIndex<Ingredient> {
	return createSearchIndex(
		ingredients,
		getIngredientId,
		getIngredientSearchFields,
	);
}

/**
 * Substring filter over the pre-normalized index. Unlike `searchByIndex`, it
 * keeps input order rather than bucketing prefix-before-substring, because the
 * sidebar re-sorts the result by the user's chosen field — ranking here would
 * be discarded. Returns the input by reference on an empty query.
 */
export function filterIngredientsByQuery(
	ingredients: Ingredient[],
	index: SearchIndex<Ingredient>,
	query: string,
): Ingredient[] {
	const needle = normalizeInput(query);

	if (!needle) {
		return ingredients;
	}

	return ingredients.filter((ingredient) =>
		index.get(ingredient.id)?.includes(needle),
	);
}

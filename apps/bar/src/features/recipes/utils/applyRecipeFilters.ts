import type { RecipeWithLines, RecipeWithRelations } from "@/db/schema/recipes";
import {
	type CocktailStyleFilter,
	DEFAULT_RECIPE_NAME,
} from "@/features/recipes/constants";
import { normalizeInput } from "@/utils";
import { createSearchIndex, type SearchIndex } from "@/utils/search";

const getRecipeId = (recipe: RecipeWithLines) => recipe.id;

function getRecipeSearchFields(recipe: RecipeWithLines): string[] {
	return [
		recipe.name || DEFAULT_RECIPE_NAME,
		...recipe.lines.map((line) => line.ingredient.name),
	];
}

export function createRecipeSearchIndex<T extends RecipeWithLines>(
	recipes: T[] | undefined,
): SearchIndex<T> {
	if (!recipes) {
		return new Map() as SearchIndex<T>;
	}
	return createSearchIndex(recipes, getRecipeId, getRecipeSearchFields);
}

export type RecipeFilters = {
	query: string;
	/** Pass null to skip the favorites filter. */
	favoriteIdSet: Set<string> | null;
	selectedTagIds: string[];
	selectedStyles: CocktailStyleFilter[];
};

/**
 * Pre-built filter Sets. `null` marks an inactive filter so the loop can skip
 * it with a single null check.
 */
type PreparedFilters = {
	favoriteIdSet: Set<string> | null;
	wantedTagIds: Set<string> | null;
	allowedStyles: Set<CocktailStyleFilter> | null;
};

function prepareFilters(filters: RecipeFilters): PreparedFilters {
	const wantedTagIds =
		filters.selectedTagIds.length > 0 ? new Set(filters.selectedTagIds) : null;

	const allowedStyles =
		filters.selectedStyles.length > 0 ? new Set(filters.selectedStyles) : null;

	return {
		favoriteIdSet: filters.favoriteIdSet,
		wantedTagIds,
		allowedStyles,
	};
}

/**
 * Recipe-attribute predicates in cheap-to-expensive order: favorites and
 * styles are a single Set.has each; tags walks `recipe.tags`. Short-circuit
 * so rejected items skip the tag walk.
 */
function matchesAttributeFilters(
	recipe: RecipeWithRelations,
	prepared: PreparedFilters,
): boolean {
	const { favoriteIdSet, allowedStyles, wantedTagIds } = prepared;

	if (favoriteIdSet !== null && !favoriteIdSet.has(recipe.id)) {
		return false;
	}

	if (allowedStyles !== null && !allowedStyles.has(recipe.style ?? null)) {
		return false;
	}

	if (wantedTagIds !== null) {
		const hasWantedTag = recipe.tags.some((rt) => wantedTagIds.has(rt.tag.id));
		if (!hasWantedTag) {
			return false;
		}
	}

	return true;
}

/**
 * Empty-query path. Returns the input array by reference when no filter is
 * active so the idle state is allocation-free.
 */
function applyNonSearchFilters(
	recipes: RecipeWithRelations[],
	prepared: PreparedFilters,
): RecipeWithRelations[] {
	const noFiltersActive =
		prepared.favoriteIdSet === null &&
		prepared.wantedTagIds === null &&
		prepared.allowedStyles === null;

	if (noFiltersActive) {
		return recipes;
	}

	return recipes.filter((recipe) => matchesAttributeFilters(recipe, prepared));
}

/**
 * Single walk over `recipes`. Survivors of the non-search predicates are
 * bucketed by whether the query is a prefix or substring of their indexed text;
 * the buckets are concatenated so prefix matches come first.
 */
function applyFilteredSearch(
	recipes: RecipeWithRelations[],
	searchIndex: SearchIndex<RecipeWithRelations>,
	prepared: PreparedFilters,
	query: string,
): RecipeWithRelations[] {
	const normalizedQuery = normalizeInput(query);
	const prefixMatches: RecipeWithRelations[] = [];
	const substringMatches: RecipeWithRelations[] = [];

	for (const recipe of recipes) {
		if (!matchesAttributeFilters(recipe, prepared)) {
			continue;
		}

		const searchableText = searchIndex.get(recipe.id);
		if (searchableText === undefined) {
			continue;
		}

		if (searchableText.startsWith(normalizedQuery)) {
			prefixMatches.push(recipe);
		} else if (searchableText.includes(normalizedQuery)) {
			substringMatches.push(recipe);
		}
	}

	return prefixMatches.concat(substringMatches);
}

/**
 * Single-pass filter for the recipes board. Branches on whether a search query
 * is present: with a query, search runs in the same loop as the other
 * predicates; without, only the non-search filters run.
 */
export function applyRecipeFilters(
	recipes: RecipeWithRelations[],
	searchIndex: SearchIndex<RecipeWithRelations>,
	filters: RecipeFilters,
): RecipeWithRelations[] {
	const prepared = prepareFilters(filters);

	if (filters.query === "") {
		return applyNonSearchFilters(recipes, prepared);
	}

	return applyFilteredSearch(recipes, searchIndex, prepared, filters.query);
}

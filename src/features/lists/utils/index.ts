import {
	type RecipeListWithEntries,
	type RecipeListWithRecipes,
	recipeListWithEntriesSchema,
} from "@/db/schema/composite";
import type {
	RecipeListEntry,
	RecipeListEntryWithRecipe,
} from "@/db/schema/recipeListEntries";
import type { RecipeList } from "@/db/schema/recipeLists";
import { DEFAULT_LIST_NAME } from "@/features/lists/constants";
import { isRecipe } from "@/features/recipes/utils";
import { isObject } from "@/utils";
import { createFetcher, fetcher } from "@/utils/api";
import { namedEntityToUrlSlug } from "@/utils/url";

export function generateDefaultRecipeListName() {
	return `List ${new Date().toLocaleString()}`;
}

export function getRecipeListUrl(list: RecipeList) {
	return `/bar/lists/${list.id}/${namedEntityToUrlSlug(list)}`;
}

export function isRecipeListEntry(o: unknown): o is RecipeListEntry {
	return (
		isObject(o) && Object.hasOwn(o, "recipeId") && Object.hasOwn(o, "listId")
	);
}

export function isRecipeList(o: unknown): o is RecipeList {
	return (
		isObject(o) && Object.hasOwn(o, "name") && Object.hasOwn(o, "isFeatured")
	);
}

export function isRecipeListWithEntries(
	o: unknown,
): o is RecipeListWithEntries {
	return isRecipeList(o) && Object.hasOwn(o, "entries");
}

export const recipeListsFetcher = createFetcher(
	recipeListWithEntriesSchema.array().optional(),
);

export const recipeListFetcher = fetcher<RecipeListWithRecipes>;

/**
 * For preview purposes. Returns null if there's no recipe.
 */
export function createDraftRecipeListEntry(
	o: Partial<RecipeListEntryWithRecipe>,
): RecipeListEntryWithRecipe | null {
	if (!isRecipe(o.recipe)) {
		return null;
	}

	return {
		id: "",
		orgId: "",
		listId: "",
		recipe: o.recipe,
		recipeId: o.recipe.id,
		price: null,
		createdAt: new Date(),
		updatedAt: null,
		sortOrder: null,
		...o,
	};
}

export function getListName(list: RecipeList) {
	return list.name ?? DEFAULT_LIST_NAME;
}

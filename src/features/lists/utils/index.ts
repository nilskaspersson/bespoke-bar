import type { RecipeListEntry } from "@/db/schema/recipeListEntries";
import {
	type RecipeList,
	recipeListWithCountSchema,
} from "@/db/schema/recipeLists";
import { isObject } from "@/utils";
import { createFetcher } from "@/utils/api";
import { namedEntityToUrlSlug } from "@/utils/url";

export function generateDefaultRecipeListName() {
	return `List ${new Date().toLocaleString()}`;
}

export function getRecipeListUrl(list: RecipeList) {
	return `/bar/lists/${list.id}/${namedEntityToUrlSlug(list)}`;
}

export function isRecipeListEntry(entry: unknown): entry is RecipeListEntry {
	return (
		isObject(entry) &&
		Object.hasOwn(entry, "recipeId") &&
		Object.hasOwn(entry, "listId")
	);
}

export const recipeListFetcher = createFetcher(
	recipeListWithCountSchema.array().optional(),
);

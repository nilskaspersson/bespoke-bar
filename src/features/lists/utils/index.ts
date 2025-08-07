import {
	type RecipeListWithEntries,
	recipeListWithEntriesSchema,
} from "@/db/schema/composite";
import type { RecipeListEntry } from "@/db/schema/recipeListEntries";
import type { RecipeList } from "@/db/schema/recipeLists";
import { isObject } from "@/utils";
import { createFetcher } from "@/utils/api";
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

export const recipeListFetcher = createFetcher(
	recipeListWithEntriesSchema.array().optional(),
);

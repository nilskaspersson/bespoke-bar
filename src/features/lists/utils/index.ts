import type { RecipeList } from "@/db/schema/recipeLists";
import { namedEntityToUrlSlug } from "@/utils/url";

export function generateDefaultRecipeListName() {
	return `List ${new Date().toLocaleString()}`;
}

export function getRecipeListUrl(list: RecipeList) {
	return `/bar/lists/${list.id}/${namedEntityToUrlSlug(list)}`;
}

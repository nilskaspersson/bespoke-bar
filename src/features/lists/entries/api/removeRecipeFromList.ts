"use server";

import type { RecipeListEntry } from "@/db/schema/recipeListEntries";
import { removeRecipeFromList as removeRecipeFromListService } from "@/features/lists/entries/api/removeRecipeFromList.service";
import { authOrForbidden } from "@/utils/auth";

export async function removeRecipeFromList(
	entryId: string,
): Promise<RecipeListEntry> {
	const auth = await authOrForbidden();
	return removeRecipeFromListService(auth, entryId);
}

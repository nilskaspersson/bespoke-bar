"use server";

import type { Recipe } from "@bespoke/schema/schema/recipes";
import { setRecipeTags as setRecipeTagsService } from "@/features/tags/api/setRecipeTags.service";
import { authOrForbidden } from "@/utils/auth";

export async function setRecipeTags(recipeId: Recipe["id"], tagIds: string[]) {
	const auth = await authOrForbidden();
	return setRecipeTagsService(auth, recipeId, tagIds);
}

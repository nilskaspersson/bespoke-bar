"use server";

import { authOrForbidden } from "@bespoke/api/auth";
import { setRecipeTags as setRecipeTagsService } from "@bespoke/api/tags/setRecipeTags.service";
import type { Recipe } from "@bespoke/schema/schema/recipes";

export async function setRecipeTags(recipeId: Recipe["id"], tagIds: string[]) {
	const auth = await authOrForbidden();
	return setRecipeTagsService(auth, recipeId, tagIds);
}

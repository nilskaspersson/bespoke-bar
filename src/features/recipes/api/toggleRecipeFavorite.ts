"use server";

import { toggleRecipeFavorite as toggleRecipeFavoriteService } from "@/features/recipes/api/toggleRecipeFavorite.service";
import { authOrForbidden } from "@/utils/auth";

export async function toggleRecipeFavorite(recipeId: string) {
	const auth = await authOrForbidden();
	return toggleRecipeFavoriteService(auth, recipeId);
}

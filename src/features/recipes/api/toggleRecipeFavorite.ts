"use server";

import { toggleRecipeFavorite as toggleRecipeFavoriteService } from "@/features/recipes/api/toggleRecipeFavorite.service";
import { rateLimit } from "@/rateLimit";
import { authOrForbidden } from "@/utils/auth";
import { catchKnownErrors } from "@/utils/serverAction";

export async function toggleRecipeFavorite(recipeId: string) {
	return catchKnownErrors(async () => {
		const auth = await authOrForbidden();
		await rateLimit(auth.userId);
		return toggleRecipeFavoriteService(auth, recipeId);
	});
}

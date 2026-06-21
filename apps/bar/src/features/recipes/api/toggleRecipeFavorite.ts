"use server";

import { authOrForbidden } from "@bespoke/api/auth";
import { toggleRecipeFavorite as toggleRecipeFavoriteService } from "@bespoke/api/recipes/toggleRecipeFavorite.service";
import { catchKnownErrors } from "@/utils/serverAction";

export async function toggleRecipeFavorite(recipeId: string) {
	return catchKnownErrors(async () => {
		const auth = await authOrForbidden();
		return toggleRecipeFavoriteService(auth, recipeId);
	});
}

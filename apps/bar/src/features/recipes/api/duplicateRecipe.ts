"use server";

import { authOrForbidden } from "@bespoke/api/auth";
import { duplicateRecipe } from "@bespoke/api/recipes/duplicateRecipe.service";
import { AppError, getAppErrorMessage } from "@bespoke/schema/appError";
import type { Recipe } from "@bespoke/schema/schema/recipes";

export async function duplicateRecipeAction(recipeId: string): Promise<Recipe> {
	const auth = await authOrForbidden();
	try {
		return await duplicateRecipe(auth, recipeId);
	} catch (error) {
		if (error instanceof AppError) {
			throw new Error(getAppErrorMessage(error.payload));
		}
		throw error;
	}
}

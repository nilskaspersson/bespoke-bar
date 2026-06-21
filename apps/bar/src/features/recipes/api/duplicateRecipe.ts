"use server";

import { getAppErrorMessage } from "@bespoke/schema/appError";
import type { Recipe } from "@bespoke/schema/schema/recipes";
import { duplicateRecipe } from "@/features/recipes/api/duplicateRecipe.service";
import { AppError } from "@/utils/appError";
import { authOrForbidden } from "@/utils/auth";

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

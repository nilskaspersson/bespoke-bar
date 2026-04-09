"use server";

import type { Recipe } from "@/db/schema/recipes";
import { duplicateRecipe } from "@/features/recipes/api/duplicateRecipe.service";
import { authOrForbidden } from "@/utils/auth";

export async function duplicateRecipeAction(recipeId: string): Promise<Recipe> {
	const auth = await authOrForbidden();
	return duplicateRecipe(auth, recipeId);
}

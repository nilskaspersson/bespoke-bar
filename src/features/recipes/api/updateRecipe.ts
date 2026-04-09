"use server";

import { parseWithZod } from "@conform-to/zod/v4";
import { redirect } from "next/navigation";
import type { InsertRecipe, Recipe } from "@/db/schema/recipes";
import { updateRecipeSchema } from "@/db/schema/recipes";
import { updateRecipe as updateRecipeService } from "@/features/recipes/api/updateRecipe.service";
import { getRecipeUrl } from "@/features/recipes/utils";
import { authOrForbidden } from "@/utils/auth";

export async function updateRecipe(
	id: Recipe["id"],
	userInputRecipe: InsertRecipe,
): Promise<Recipe> {
	const auth = await authOrForbidden();
	return updateRecipeService(auth, id, userInputRecipe);
}

export const updateRecipeAction = async (
	id: Recipe["id"],
	_prevState: unknown,
	formData: FormData,
) => {
	const submission = parseWithZod(formData, {
		schema: updateRecipeSchema,
	});

	if (submission.status !== "success" || !id) {
		return submission.reply();
	}

	/**
	 * Conform converts empty strings to undefined. Convert undefined back to null for
	 * the fields we want to allow users to clear,
	 */
	const patchRecipeData = {
		...submission.value,
		description: submission.value.description ?? null,
		garnish: submission.value.garnish ?? null,
		glassware: submission.value.glassware ?? null,
	};

	let result: Recipe;

	try {
		result = await updateRecipe(id, patchRecipeData);
	} catch (_error) {
		return submission.reply({
			formErrors: ["Failed to update recipe"],
		});
	}

	if (result) {
		redirect(getRecipeUrl(result));
	}

	return submission.reply({
		resetForm: true,
	});
};

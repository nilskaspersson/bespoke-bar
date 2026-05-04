"use server";

import { parseWithZod } from "@conform-to/zod/v4";
import { redirect } from "next/navigation";
import z from "zod";
import { type RecipeFormData, recipeFormSchema } from "@/db/schema/composite";
import type { Recipe } from "@/db/schema/recipes";
import { upsertRecipesWithSpecs as upsertRecipesWithSpecsService } from "@/features/recipes/api/upsertRecipesWithSpecs.service";
import { getRecipeUrl } from "@/features/recipes/utils";
import { AppError, getAppErrorMessage } from "@/utils/appError";
import { authOrForbidden } from "@/utils/auth";

export async function upsertRecipesWithSpecs(
	userInputRecipes: RecipeFormData[],
) {
	const auth = await authOrForbidden();
	try {
		return await upsertRecipesWithSpecsService(auth, userInputRecipes);
	} catch (error) {
		if (error instanceof AppError) {
			throw new Error(getAppErrorMessage(error.payload));
		}
		throw error;
	}
}

export async function upsertRecipeWithSpecsAction(formData: FormData) {
	const submission = parseWithZod(formData, {
		schema: recipeFormSchema,
	});

	if (submission.status !== "success") {
		return submission.reply();
	}

	const data = Array.isArray(submission.value)
		? submission.value
		: [submission.value];

	let result: Recipe[];

	try {
		result = await upsertRecipesWithSpecs(data);
	} catch (error) {
		console.error(error);

		return submission.reply({
			formErrors: [
				error instanceof Error ? error.message : "Failed to upsert recipe",
			],
		});
	}

	if (result.length === 1) {
		redirect(getRecipeUrl(result[0]));
	}

	return submission.reply({
		resetForm: true,
	});
}

export async function createRecipesWithSpecsFromData(
	userInputRecipes: RecipeFormData[],
): Promise<Recipe[]> {
	const parsedData = z.array(recipeFormSchema).parse(userInputRecipes);
	return await upsertRecipesWithSpecs(parsedData);
}

"use server";

import type { SubmissionResult } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import z from "zod";
import { type RecipeFormData, recipeFormSchema } from "@/db/schema/composite";
import type { Recipe } from "@/db/schema/recipes";
import { upsertRecipesWithLines as upsertRecipesWithLinesService } from "@/features/recipes/api/upsertRecipesWithLines.service";
import { AppError, getAppErrorMessage } from "@/utils/appError";
import { authOrForbidden } from "@/utils/auth";

async function upsertRecipesWithLines(userInputRecipes: RecipeFormData[]) {
	const auth = await authOrForbidden();
	try {
		return await upsertRecipesWithLinesService(auth, userInputRecipes);
	} catch (error) {
		if (error instanceof AppError) {
			throw new Error(getAppErrorMessage(error.payload));
		}
		throw error;
	}
}

export type UpsertRecipeWithLinesActionResult = {
	result: SubmissionResult;
	recipes?: Recipe[];
};

export async function upsertRecipeWithLinesAction(
	formData: FormData,
): Promise<UpsertRecipeWithLinesActionResult> {
	const submission = parseWithZod(formData, {
		schema: recipeFormSchema,
	});

	if (submission.status !== "success") {
		return { result: submission.reply() };
	}

	const data = Array.isArray(submission.value)
		? submission.value
		: [submission.value];

	try {
		const recipes = await upsertRecipesWithLines(data);
		return { result: submission.reply(), recipes };
	} catch (error) {
		console.error(error);

		return {
			result: submission.reply({
				formErrors: [
					error instanceof Error ? error.message : "Failed to upsert recipe",
				],
			}),
		};
	}
}

export async function createRecipesWithLinesFromData(
	userInputRecipes: RecipeFormData[],
): Promise<Recipe[]> {
	const parsedData = z.array(recipeFormSchema).parse(userInputRecipes);
	return await upsertRecipesWithLines(parsedData);
}

"use server";

import { authOrForbidden } from "@bespoke/api/auth";
import { upsertRecipesWithLines as upsertRecipesWithLinesService } from "@bespoke/api/recipes/upsertRecipesWithLines.service";
import { AppError, getAppErrorMessage } from "@bespoke/schema/appError";
import {
	type RecipeFormData,
	recipeFormSchema,
} from "@bespoke/schema/schema/composite";
import type { Recipe } from "@bespoke/schema/schema/recipes";
import type { SubmissionResult } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import z from "zod";

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

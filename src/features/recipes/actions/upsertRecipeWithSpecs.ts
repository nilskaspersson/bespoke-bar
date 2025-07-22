"use server";

import { parseWithZod } from "@conform-to/zod/v4";
import { redirect } from "next/navigation";
import z from "zod/v4";
import { db } from "@/db";
import { type RecipeFormData, recipeFormSchema } from "@/db/schema/composite";
import type { Recipe } from "@/db/schema/recipes";
import {
	insertIngredientsInTransaction,
	replaceSpecsInTransaction,
	upsertRecipeInTransaction,
} from "@/features/recipes/actions/utils/transactionHelpers";
import { getRecipeUrl } from "@/features/recipes/utils";
import { extractIngredientsToCreate } from "@/features/recipes/utils/schema";
import { revalidateRecipePaths } from "@/features/recipes/utils/server";
import { authOrForbidden } from "@/utils/auth";

async function upsertRecipesWithSpecs(userInputRecipes: RecipeFormData[]) {
	const { userId, orgId } = await authOrForbidden();

	const ingredientsToCreate = extractIngredientsToCreate(
		userInputRecipes,
		userId,
		orgId,
	);

	const result = await db.transaction(async (tx) => {
		/**
		 * Step 1: Insert all new ingredients once and create a name-to-id mapping
		 */
		const createdIngredientNamesToId = await insertIngredientsInTransaction(
			tx,
			Array.from(ingredientsToCreate.values()),
		);

		/**
		 * Step 2: Create or update each recipe
		 */
		const processedRecipes: Recipe[] = [];

		for (const o of userInputRecipes) {
			/**
			 * Step 3: Upsert the recipe
			 */
			const processedRecipe = await upsertRecipeInTransaction(
				tx,
				o.recipe,
				userId,
				orgId,
			);

			/**
			 * Step 4: Replace all specs for the recipe with provided specs
			 * TODO: Merge with `processedRecipe` for a more complete return value?
			 */
			await replaceSpecsInTransaction(
				tx,
				processedRecipe.id,
				o.specs,
				createdIngredientNamesToId,
			);

			processedRecipes.push(processedRecipe);
		}

		return processedRecipes;
	});

	revalidateRecipePaths(result.map((r) => r.id));

	return result;
}

export async function upsertRecipeWithSpecsAction(
	_prevState: unknown,
	formData: FormData,
) {
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
	} catch (_error) {
		return submission.reply({
			formErrors: ["Failed to upsert recipe"],
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

"use server";

import { parseWithZod } from "@conform-to/zod/v4";
import { and, eq, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import {
	type InsertRecipe,
	type Recipe,
	RecipesTable,
	updateRecipeSchema,
} from "@/db/schema/recipes";
import { getRecipeUrl } from "@/features/recipes/utils";
import { authOrForbidden } from "@/utils/auth";
import { cacheEvents } from "@/utils/cache";

export async function updateRecipe(
	id: Recipe["id"],
	userInputRecipe: InsertRecipe,
): Promise<Recipe> {
	const validatedUserInputRecipe = updateRecipeSchema.parse(userInputRecipe);

	const { userId, orgId } = await authOrForbidden();

	const [result] = await db
		.update(RecipesTable)
		.set({
			...validatedUserInputRecipe,
			updatedAt: sql`NOW()`,
			updatedBy: userId,
		})
		.where(and(eq(RecipesTable.id, id), eq(RecipesTable.orgId, orgId)))
		.returning();

	cacheEvents.recipe.update.emit(orgId, id);

	return result;
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

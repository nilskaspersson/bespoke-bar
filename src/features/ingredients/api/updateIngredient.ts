"use server";

import { parseWithZod } from "@conform-to/zod/v4";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import type { DraftIngredient, Ingredient } from "@/db/schema/ingredients";
import {
	IngredientsTable,
	updateIngredientSchema,
} from "@/db/schema/ingredients";
import { isUniqueConstraintViolation } from "@/db/utils";
import { getCachedIngredient } from "@/features/ingredients/api/readIngredient";
import { ingredientEnrichmentSchema } from "@/features/ingredients/utils/getIngredientMetaDataWithLLM";

import { isEmpty } from "@/utils";
import { authOrForbidden } from "@/utils/auth";
import { cacheEvents } from "@/utils/cache";

const aiEnrichedFieldsSchema = z
	.array(ingredientEnrichmentSchema.keyof())
	.nullish();

export async function updateIngredient(
	id: string,
	userInputIngredient: Partial<DraftIngredient>,
): Promise<Ingredient> {
	const validatedInput = updateIngredientSchema.parse(userInputIngredient);

	const { userId, orgId } = await authOrForbidden();

	const current = await getCachedIngredient(orgId, id);

	if (!current) {
		throw new Error("Ingredient not found");
	}

	/**
	 * Remove AI-enriched fields that the user is now providing values for
	 */
	const aiFields = aiEnrichedFieldsSchema.parse(current.aiEnrichedFields) ?? [];

	const aiEnrichedFields = aiFields.filter((k) => isEmpty(validatedInput[k]));

	const [result] = await db
		.update(IngredientsTable)
		.set({
			...validatedInput,
			aiEnrichedFields: aiEnrichedFields.length > 0 ? aiEnrichedFields : null,
			updatedAt: sql`NOW()`,
			updatedBy: userId,
		})
		.where(and(eq(IngredientsTable.id, id), eq(IngredientsTable.orgId, orgId)))
		.returning();

	cacheEvents.ingredient.update.emit(orgId, id);

	return result;
}

export async function updateIngredientAction(
	id: Ingredient["id"],
	formData: FormData,
) {
	const submission = parseWithZod(formData, {
		schema: updateIngredientSchema,
	});

	if (submission.status !== "success" || !id) {
		return submission.reply();
	}

	try {
		await updateIngredient(id, submission.value);
	} catch (error) {
		if (
			isUniqueConstraintViolation(
				error,
				"unique_ingredient_name_case_insensitive",
			)
		) {
			return submission.reply({
				fieldErrors: {
					name: ["An ingredient with this name already exists."],
				},
			});
		}

		return submission.reply({
			formErrors: ["Failed to update ingredient."],
		});
	}

	return submission.reply();
}

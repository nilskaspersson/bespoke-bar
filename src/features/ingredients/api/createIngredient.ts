"use server";

import { after } from "next/server";
import { db } from "@/db";
import {
	type DraftIngredient,
	type Ingredient,
	IngredientsTable,
	insertIngredientSchema,
} from "@/db/schema/ingredients";
import { isUniqueConstraintViolation } from "@/db/utils";
import { enrichIngredients } from "@/features/ingredients/api/enrichIngredients";
import { authOrForbidden } from "@/utils/auth";
import { cacheEvents } from "@/utils/cache";

/**
 * Create a new ingredient in the database.
 * After creation, asynchronously enriches the ingredient with LLM-generated data.
 * @param userInputIngredient - The ingredient data from user input
 * @returns Newly created ingredient
 */
export async function createIngredient(
	userIngredient: DraftIngredient,
): Promise<Ingredient> {
	const { userId, orgId } = await authOrForbidden();

	const validatedUserInputIngredient = insertIngredientSchema.parse({
		...userIngredient,
		orgId,
		createdBy: userId,
	});

	let ingredient: Ingredient;

	try {
		[ingredient] = await db
			.insert(IngredientsTable)
			.values(validatedUserInputIngredient)
			.returning();
	} catch (error) {
		if (
			isUniqueConstraintViolation(
				error,
				"unique_ingredient_name_case_insensitive",
			)
		) {
			throw new Error("An ingredient with this name already exists.");
		}
		throw error;
	}

	cacheEvents.ingredient.create.emit(orgId);

	after(async () => {
		try {
			await enrichIngredients(orgId, ingredient);
		} catch (error) {
			console.error("Ingredient enrichment failed:", error);
		}
	});

	return ingredient;
}

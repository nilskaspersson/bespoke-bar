"use server";

import { after } from "next/server";
import { db } from "@/db";
import {
	type DraftIngredient,
	type Ingredient,
	IngredientsTable,
	insertIngredientSchema,
} from "@/db/schema/ingredients";
import { enrichIngredients } from "@/features/ingredients/api/enrichIngredient";
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

	const [ingredient] = await db
		.insert(IngredientsTable)
		.values(validatedUserInputIngredient)
		.returning();

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

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
import type { Auth } from "@/utils/auth";
import { cacheEvents } from "@/utils/cache";

export async function createIngredient(
	auth: Auth,
	userIngredient: DraftIngredient,
): Promise<Ingredient> {
	const validatedUserInputIngredient = insertIngredientSchema.parse({
		...userIngredient,
		orgId: auth.orgId,
		createdBy: auth.userId,
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

	cacheEvents.ingredient.create.emit(auth.orgId);

	after(async () => {
		try {
			await enrichIngredients(auth.orgId, ingredient);
		} catch (error) {
			console.error("Ingredient enrichment failed:", error);
		}
	});

	return ingredient;
}

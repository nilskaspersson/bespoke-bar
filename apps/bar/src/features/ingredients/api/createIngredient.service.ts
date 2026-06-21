import {
	type DraftIngredient,
	type Ingredient,
	IngredientsTable,
	insertIngredientSchema,
} from "@bespoke/schema/schema/ingredients";
import { after } from "next/server";
import { db } from "@/db";
import { isUniqueConstraintViolation } from "@/db/utils";
import { enrichIngredients } from "@/features/ingredients/api/enrichIngredients";
import { rateLimit } from "@/rateLimit";
import type { Auth } from "@/utils/auth";
import { cacheEvents } from "@/utils/cache";

export async function createIngredient(
	auth: Auth,
	userIngredient: DraftIngredient,
): Promise<Ingredient> {
	const { userId, orgId } = auth;

	await rateLimit(userId);

	const validatedUserInputIngredient = insertIngredientSchema.parse({
		...userIngredient,
		orgId: orgId,
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

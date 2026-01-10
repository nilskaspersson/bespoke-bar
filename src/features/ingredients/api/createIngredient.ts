import { db } from "@/db";
import {
	type DraftIngredient,
	type Ingredient,
	IngredientsTable,
	insertIngredientSchema,
} from "@/db/schema/ingredients";
import { authOrForbidden } from "@/utils/auth";
import { cacheEvents } from "@/utils/cache";

/**
 * Create a new ingredient in the database.
 * @param userInputIngredient - The ingredient data from user input
 * @returns Newly created ingredient
 */
export async function createIngredient(
	userIngredient: DraftIngredient,
): Promise<Ingredient> {
	"use server";

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

	return ingredient;
}

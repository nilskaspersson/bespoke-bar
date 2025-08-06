import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import type { DraftIngredient, Ingredient } from "@/db/schema/ingredients";
import {
	IngredientsTable,
	updateIngredientSchema,
} from "@/db/schema/ingredients";
import { authOrForbidden } from "@/utils/auth";
import { cacheEvents } from "@/utils/cache";

export async function updateIngredient(
	id: string,
	userInputIngredient: Partial<DraftIngredient>,
): Promise<Ingredient> {
	"use server";

	const { userId, orgId } = await authOrForbidden();

	const validatedUserInputIngredient =
		updateIngredientSchema.parse(userInputIngredient);

	const [result] = await db
		.update(IngredientsTable)
		.set({
			...validatedUserInputIngredient,
			updatedAt: sql`NOW()`,
			updatedBy: userId,
		})
		.where(and(eq(IngredientsTable.id, id), eq(IngredientsTable.orgId, orgId)))
		.returning();

	cacheEvents.ingredient.update.emit(orgId, id);

	return result;
}

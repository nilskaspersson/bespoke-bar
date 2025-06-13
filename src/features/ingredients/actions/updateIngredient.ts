import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import type { DraftIngredient, Ingredient } from "@/db/schema/ingredients";
import {
	IngredientsTable,
	updateIngredientSchema,
} from "@/db/schema/ingredients";
import { revalidateIngredientPaths } from "@/features/ingredients/utils";
import { authOrForbidden } from "@/utils/auth";

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

	revalidateIngredientPaths(id);

	return result;
}

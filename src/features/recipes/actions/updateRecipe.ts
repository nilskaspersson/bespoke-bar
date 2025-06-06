import { auth } from "@clerk/nextjs/server";
import { and, eq, or, sql } from "drizzle-orm";
import { forbidden } from "next/navigation";
import { db } from "@/db";
import {
	type InsertRecipe,
	type Recipe,
	RecipesTable,
	updateRecipeSchema,
} from "@/db/schema/recipes";

export async function updateRecipe(
	id: Recipe["id"],
	userInputRecipe: InsertRecipe,
): Promise<Recipe> {
	"use server";

	const { userId, orgId } = await auth();

	if (!userId) {
		forbidden();
	}

	const validatedUserInputRecipe = updateRecipeSchema.parse(userInputRecipe);

	const [result] = await db
		.update(RecipesTable)
		.set({ ...validatedUserInputRecipe, updatedAt: sql`NOW()` })
		.where(
			and(
				eq(RecipesTable.id, id),
				orgId
					? or(
							eq(RecipesTable.createdBy, userId),
							eq(RecipesTable.orgId, orgId),
						)
					: eq(RecipesTable.createdBy, userId),
			),
		)
		.returning();

	return result;
}

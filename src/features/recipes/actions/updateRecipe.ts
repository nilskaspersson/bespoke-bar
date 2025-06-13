import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import {
	type InsertRecipe,
	type Recipe,
	RecipesTable,
	updateRecipeSchema,
} from "@/db/schema/recipes";
import { revalidateRecipePaths } from "@/features/recipes/utils";
import { authOrForbidden } from "@/utils/auth";

export async function updateRecipe(
	id: Recipe["id"],
	userInputRecipe: InsertRecipe,
): Promise<Recipe> {
	"use server";

	const { userId, orgId } = await authOrForbidden();

	const validatedUserInputRecipe = updateRecipeSchema.parse(userInputRecipe);

	const [result] = await db
		.update(RecipesTable)
		.set({
			...validatedUserInputRecipe,
			updatedAt: sql`NOW()`,
			updatedBy: userId,
		})
		.where(and(eq(RecipesTable.id, id), eq(RecipesTable.orgId, orgId)))
		.returning();

	revalidateRecipePaths(id);

	return result;
}

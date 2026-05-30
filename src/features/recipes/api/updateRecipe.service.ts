import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import {
	type InsertRecipe,
	type Recipe,
	RecipesTable,
	updateRecipeSchema,
} from "@/db/schema/recipes";
import { getCachedRecipe } from "@/features/recipes/api/readRecipe";
import { clearTouchedAiMarks } from "@/features/recipes/api/utils/aiEnrichedFields";
import { rateLimit } from "@/rateLimit";
import type { Auth } from "@/utils/auth";
import { cacheEvents } from "@/utils/cache";

export async function updateRecipe(
	auth: Auth,
	id: Recipe["id"],
	userInputRecipe: InsertRecipe,
): Promise<Recipe> {
	const { userId, orgId } = auth;

	await rateLimit(userId);

	const validatedUserInputRecipe = updateRecipeSchema.parse(userInputRecipe);

	const current = await getCachedRecipe(orgId, id);

	const [result] = await db
		.update(RecipesTable)
		.set({
			...validatedUserInputRecipe,
			aiEnrichedFields: clearTouchedAiMarks(
				current?.aiEnrichedFields,
				validatedUserInputRecipe,
			),
			updatedAt: sql`NOW()`,
			updatedBy: userId,
		})
		.where(and(eq(RecipesTable.id, id), eq(RecipesTable.orgId, orgId)))
		.returning();

	cacheEvents.recipe.update.emit(orgId, id);

	return result;
}

import { db } from "@bespoke/db";
import {
	type InsertRecipe,
	type Recipe,
	RecipesTable,
	updateRecipeSchema,
} from "@bespoke/schema/schema/recipes";
import { and, eq, sql } from "drizzle-orm";
import type { Auth } from "../auth";
import { cacheEvents } from "../cache";
import { rateLimit } from "../rateLimit";
import { getCachedRecipe } from "./readRecipe";
import { clearTouchedAiMarks } from "./utils/aiEnrichedFields";

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
				current ?? {},
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

import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import {
	RecipeListEntriesTable,
	type RecipeListEntry,
	recipeListEntryFormSchema,
	type UpdateRecipeListEntry,
} from "@/db/schema/recipeListEntries";
import type { Auth } from "@/utils/auth";
import { cacheEvents } from "@/utils/cache";

export async function updateRecipeListEntry(
	auth: Auth,
	id: RecipeListEntry["id"],
	userInputData: UpdateRecipeListEntry,
): Promise<RecipeListEntry> {
	const validatedUserInputData = recipeListEntryFormSchema.parse(userInputData);

	const { orgId } = auth;

	const [result] = await db
		.update(RecipeListEntriesTable)
		.set({ ...validatedUserInputData, updatedAt: sql`NOW()` })
		.where(
			and(
				eq(RecipeListEntriesTable.id, id),
				eq(RecipeListEntriesTable.orgId, orgId),
			),
		)
		.returning();

	cacheEvents.recipeList.update.emit(orgId, result.listId);

	return result;
}

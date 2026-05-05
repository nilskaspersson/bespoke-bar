import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import {
	RecipeListEntriesTable,
	type RecipeListEntry,
} from "@/db/schema/recipeListEntries";
import { RecipeListsTable } from "@/db/schema/recipeLists";
import { rateLimit } from "@/rateLimit";
import type { Auth } from "@/utils/auth";
import { cacheEvents } from "@/utils/cache";

export async function removeRecipeFromList(
	auth: Auth,
	entryId: string,
): Promise<RecipeListEntry> {
	const { userId, orgId } = auth;

	await rateLimit(userId);

	const deletedEntry = await db.transaction(async (tx) => {
		const [entry] = await tx
			.delete(RecipeListEntriesTable)
			.where(
				and(
					eq(RecipeListEntriesTable.id, entryId),
					eq(RecipeListEntriesTable.orgId, orgId),
				),
			)
			.returning();

		if (!entry) {
			throw new Error("Recipe not found, or access denied");
		}

		await tx
			.update(RecipeListsTable)
			.set({ updatedAt: sql`NOW()` })
			.where(
				and(
					eq(RecipeListsTable.id, entry.listId),
					eq(RecipeListsTable.orgId, orgId),
				),
			);

		return entry;
	});

	cacheEvents.recipeList.update.emit(orgId, deletedEntry.listId);

	return deletedEntry;
}

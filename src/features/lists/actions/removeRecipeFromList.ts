"use server";

import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import {
	RecipeListEntriesTable,
	type RecipeListEntry,
} from "@/db/schema/recipeListEntries";
import { RecipeListsTable } from "@/db/schema/recipeLists";
import { authOrForbidden } from "@/utils/auth";
import { cacheEvents } from "@/utils/cache";

export async function removeRecipeFromList(
	entryId: string,
): Promise<RecipeListEntry> {
	const { orgId } = await authOrForbidden();

	const deletedEntry = await db.transaction(async (tx) => {
		const [entry] = await db
			.delete(RecipeListEntriesTable)
			.where(
				and(
					eq(RecipeListEntriesTable.id, entryId),
					eq(RecipeListEntriesTable.orgId, orgId),
				),
			)
			.returning();

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

	if (!deletedEntry) {
		throw new Error("Recipe not found, or access denied");
	}

	cacheEvents.recipeList.update.emit(orgId, deletedEntry.listId);

	return deletedEntry;
}

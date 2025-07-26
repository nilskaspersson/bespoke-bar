import { and, eq, sql } from "drizzle-orm";
import type { DatabaseTransaction } from "@/db";
import type { RecipeListWithEntriesFormData } from "@/db/schema/composite";
import {
	type InsertRecipeListEntry,
	insertRecipeListEntrySchema,
	RecipeListEntriesTable,
} from "@/db/schema/recipeListEntries";
import { type RecipeList, RecipeListsTable } from "@/db/schema/recipeLists";
import { generateDefaultRecipeListName } from "@/features/lists/utils";

export async function upsertRecipeListInTransaction(
	tx: DatabaseTransaction,
	recipeListData: RecipeListWithEntriesFormData["recipeList"],
	userId: string,
	orgId: string,
): Promise<RecipeList> {
	/**
	 * Update existing list if it has an ID
	 */
	if (recipeListData.id) {
		const [updatedList] = await tx
			.update(RecipeListsTable)
			.set({
				...recipeListData,
				name: recipeListData.name || generateDefaultRecipeListName(),
				updatedAt: sql`NOW()`,
				updatedBy: userId,
			})
			.where(
				and(
					eq(RecipeListsTable.id, recipeListData.id),
					eq(RecipeListsTable.orgId, orgId),
				),
			)
			.returning();

		if (!updatedList) {
			throw new Error("List not found or access denied");
		}

		return updatedList;
	}

	const [newList] = await tx
		.insert(RecipeListsTable)
		.values({
			...recipeListData,
			name: recipeListData.name || generateDefaultRecipeListName(),
			orgId,
			createdBy: userId,
		})
		.returning();

	return newList;
}

/**
 * Replace all entries in a list (delete existing, insert new).
 */
export async function replaceRecipeListEntriesInTransaction(
	tx: DatabaseTransaction,
	listId: string,
	entries: RecipeListWithEntriesFormData["entries"],
	orgId: string,
): Promise<void> {
	/**
	 * Delete all existing entries
	 */
	await tx
		.delete(RecipeListEntriesTable)
		.where(
			and(
				eq(RecipeListEntriesTable.orgId, orgId),
				eq(RecipeListEntriesTable.listId, listId),
			),
		);

	/**
	 * Insert all provided entries
	 */
	if (entries.length > 0) {
		const entriesToInsert: InsertRecipeListEntry[] = entries.map(
			(entry, index) => ({
				listId,
				recipeId: entry.recipeId,
				price: entry.price,
				sortOrder: entry.sortOrder ?? index,
				orgId,
			}),
		);

		const validatedEntries = insertRecipeListEntrySchema
			.array()
			.parse(entriesToInsert);

		await tx.insert(RecipeListEntriesTable).values(validatedEntries);
	}
}

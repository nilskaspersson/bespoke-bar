"use server";

import { db } from "@/db";
import {
	type InsertRecipeListEntry,
	insertRecipeListEntrySchema,
	RecipeListEntriesTable,
} from "@/db/schema/recipeListEntries";
import {
	type InsertRecipeList,
	insertRecipeListSchema,
	type RecipeList,
	RecipeListsTable,
} from "@/db/schema/recipeLists";
import { generateDefaultRecipeListName } from "@/features/lists/utils";
import { authOrForbidden } from "@/utils/auth";

export async function createRecipeListWithRecipes(
	userInputList: Partial<InsertRecipeList>,
	recipeIds: string[],
): Promise<RecipeList> {
	const { userId, orgId } = await authOrForbidden();

	/**
	 * Use a timestamp as a fallback name
	 * TODO: Move to implementation point for local formatting + schema validation?
	 */
	const name = userInputList.name || generateDefaultRecipeListName();

	const result = await db.transaction(async (tx) => {
		const validatedList = insertRecipeListSchema.parse({
			...userInputList,
			name,
			orgId,
			createdBy: userId,
		});

		const [list] = await tx
			.insert(RecipeListsTable)
			.values(validatedList)
			.returning();

		if (recipeIds.length > 0) {
			const entriesToInsert: InsertRecipeListEntry[] = recipeIds.map(
				(recipeId, index) => ({
					recipeId,
					listId: list.id,
					/**
					 * Use selection order for now, maybe allow setting this immediately later?
					 */
					sortOrder: index + 1,
					addedBy: userId,
				}),
			);

			const validatedEntries = insertRecipeListEntrySchema
				.array()
				.parse(entriesToInsert);

			await tx.insert(RecipeListEntriesTable).values(validatedEntries);
		}

		return list;
	});

	return result;
}

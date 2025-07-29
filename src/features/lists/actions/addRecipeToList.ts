"use server";

import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import {
	type InsertRecipeListEntry,
	insertRecipeListEntrySchema,
	RecipeListEntriesTable,
	type RecipeListEntry,
	type RecipeListEntryFormData,
} from "@/db/schema/recipeListEntries";
import { RecipeListsTable } from "@/db/schema/recipeLists";
import { revalidateRecipeListPaths } from "@/features/lists/utils/server";
import { authOrForbidden } from "@/utils/auth";

export async function addRecipeToList(
	listId: string,
	userInput: RecipeListEntryFormData,
): Promise<RecipeListEntry> {
	const { orgId } = await authOrForbidden();

	/**
	 * Validate early to avoid querying the list. We will validate again later once we
	 * have a sort order.
	 */
	const validatedInput: InsertRecipeListEntry =
		insertRecipeListEntrySchema.parse({
			listId,
			recipeId: userInput.recipeId,
			orgId,
			price: userInput.price ?? null,
		});

	const list = await db.query.RecipeListsTable.findFirst({
		where: and(
			eq(RecipeListsTable.id, listId),
			eq(RecipeListsTable.orgId, orgId),
		),
		with: {
			entries: {
				columns: {
					sortOrder: true,
				},
			},
		},
	});

	if (!list) {
		throw new Error("List not found or access denied");
	}

	const maxSortOrder =
		list.entries.length > 0
			? Math.max(...list.entries.map((entry) => entry.sortOrder ?? 0))
			: 0;

	const validatedEntry: InsertRecipeListEntry =
		insertRecipeListEntrySchema.parse({
			...validatedInput,
			sortOrder: maxSortOrder + 1,
		});

	const entry = await db.transaction(async (tx) => {
		const [newEntry] = await tx
			.insert(RecipeListEntriesTable)
			.values(validatedEntry)
			.returning();

		await tx
			.update(RecipeListsTable)
			.set({ updatedAt: sql`NOW()` })
			.where(
				and(
					eq(RecipeListsTable.id, newEntry.listId),
					eq(RecipeListsTable.orgId, orgId),
				),
			);

		return newEntry;
	});

	revalidateRecipeListPaths({
		id: listId,
		shouldRevalidateBar: list.isFeatured,
	});

	return entry;
}

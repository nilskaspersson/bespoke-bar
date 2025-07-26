"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import {
	type InsertRecipeListEntry,
	insertRecipeListEntrySchema,
	RecipeListEntriesTable,
} from "@/db/schema/recipeListEntries";
import { RecipeListsTable } from "@/db/schema/recipeLists";
import { authOrForbidden } from "@/utils/auth";

export async function addRecipeToList(
	listId: string,
	recipeId: string,
	price?: number,
): Promise<void> {
	const { orgId } = await authOrForbidden();

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
			? Math.max(...list.entries.map((entry) => entry.sortOrder))
			: 0;

	const nextSortOrder = maxSortOrder + 1;

	const validatedEntry = insertRecipeListEntrySchema.parse({
		listId,
		recipeId,
		orgId,
		sortOrder: nextSortOrder,
		price: price ?? null,
	} satisfies InsertRecipeListEntry);

	await db.insert(RecipeListEntriesTable).values(validatedEntry);

	revalidatePath(`/bar/lists/${listId}`, "layout");
}

"use server";

import { parseWithZod } from "@conform-to/zod/v4";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import {
	type InsertRecipeListEntry,
	insertRecipeListEntrySchema,
	RecipeListEntriesTable,
	type RecipeListEntry,
	type RecipeListEntryFormData,
	recipeListEntryFormSchema,
} from "@/db/schema/recipeListEntries";
import { RecipeListsTable } from "@/db/schema/recipeLists";
import { authOrForbidden } from "@/utils/auth";
import { cacheEvents } from "@/utils/cache";

export async function addRecipeToList(
	userInput: RecipeListEntryFormData,
): Promise<RecipeListEntry> {
	const { orgId } = await authOrForbidden();

	/**
	 * Validate early to avoid querying the list. We will validate again later once we
	 * have a sort order.
	 */
	const validatedInput: InsertRecipeListEntry =
		insertRecipeListEntrySchema.parse({
			listId: userInput.listId,
			recipeId: userInput.recipeId,
			orgId,
			price: userInput.price ?? null,
		});

	const list = await db.query.RecipeListsTable.findFirst({
		where: and(
			eq(RecipeListsTable.id, validatedInput.listId),
			eq(RecipeListsTable.orgId, orgId),
		),
		with: {
			entries: {
				columns: {
					recipeId: true,
					sortOrder: true,
				},
			},
		},
	});

	if (!list) {
		throw new Error("List not found or access denied");
	}

	if (
		list.entries.some((entry) => entry.recipeId === validatedInput.recipeId)
	) {
		throw new Error("Recipe is already in list");
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
					eq(RecipeListsTable.id, list.id),
					eq(RecipeListsTable.orgId, orgId),
				),
			);

		return newEntry;
	});

	cacheEvents.recipeList.update.emit(orgId, list.id);

	return entry;
}

export const addRecipeToListAction = async (formData: FormData) => {
	const submission = parseWithZod(formData, {
		schema: recipeListEntryFormSchema,
	});

	if (submission.status !== "success") {
		return submission.reply();
	}

	return await addRecipeToList(submission.value);
};

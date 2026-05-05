import { and, eq, max, sql } from "drizzle-orm";
import { db } from "@/db";
import {
	type InsertRecipeListEntry,
	insertRecipeListEntrySchema,
	RecipeListEntriesTable,
	type RecipeListEntry,
	type RecipeListEntryFormData,
} from "@/db/schema/recipeListEntries";
import { RecipeListsTable } from "@/db/schema/recipeLists";
import { rateLimit } from "@/rateLimit";
import type { Auth } from "@/utils/auth";
import { cacheEvents } from "@/utils/cache";

export async function addRecipeToList(
	auth: Auth,
	userInput: RecipeListEntryFormData,
): Promise<RecipeListEntry> {
	const { userId, orgId } = auth;

	await rateLimit(userId);

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

	const [list] = await db
		.select({
			id: RecipeListsTable.id,
			existingEntryId: RecipeListEntriesTable.id,
		})
		.from(RecipeListsTable)
		.leftJoin(
			RecipeListEntriesTable,
			and(
				eq(RecipeListEntriesTable.listId, RecipeListsTable.id),
				eq(RecipeListEntriesTable.recipeId, validatedInput.recipeId),
			),
		)
		.where(
			and(
				eq(RecipeListsTable.id, validatedInput.listId),
				eq(RecipeListsTable.orgId, orgId),
			),
		);

	if (!list) {
		throw new Error("List not found or access denied");
	}

	if (list.existingEntryId) {
		throw new Error("Recipe is already in list");
	}

	/**
	 * Find largest current sort order
	 */
	const [{ maxSortOrder }] = await db
		.select({ maxSortOrder: max(RecipeListEntriesTable.sortOrder) })
		.from(RecipeListEntriesTable)
		.where(eq(RecipeListEntriesTable.listId, validatedInput.listId));

	const validatedEntry: InsertRecipeListEntry =
		insertRecipeListEntrySchema.parse({
			...validatedInput,
			sortOrder: (maxSortOrder ?? 0) + 1,
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

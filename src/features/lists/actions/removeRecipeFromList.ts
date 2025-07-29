"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import {
	RecipeListEntriesTable,
	type RecipeListEntry,
} from "@/db/schema/recipeListEntries";
import { authOrForbidden } from "@/utils/auth";

export async function removeRecipeFromList(
	entryId: string,
): Promise<RecipeListEntry> {
	const { orgId } = await authOrForbidden();

	const [deletedEntry] = await db
		.delete(RecipeListEntriesTable)
		.where(
			and(
				eq(RecipeListEntriesTable.orgId, orgId),
				eq(RecipeListEntriesTable.id, entryId),
			),
		)
		.returning();

	if (!deletedEntry) {
		throw new Error("Recipe not found, or access denied");
	}

	revalidatePath(`/bar/lists/${deletedEntry.listId}`, "layout");

	return deletedEntry;
}

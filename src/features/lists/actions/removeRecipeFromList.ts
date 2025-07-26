"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { RecipeListEntriesTable } from "@/db/schema/recipeListEntries";
import { authOrForbidden } from "@/utils/auth";

export async function removeRecipeFromList(
	listId: string,
	recipeId: string,
): Promise<void> {
	const { orgId } = await authOrForbidden();

	const deletedEntries = await db
		.delete(RecipeListEntriesTable)
		.where(
			and(
				eq(RecipeListEntriesTable.orgId, orgId),
				eq(RecipeListEntriesTable.listId, listId),
				eq(RecipeListEntriesTable.recipeId, recipeId),
			),
		)
		.returning();

	if (deletedEntries.length === 0) {
		throw new Error("Recipe not found in list or access denied");
	}

	revalidatePath(`/bar/lists/${listId}`, "layout");
}

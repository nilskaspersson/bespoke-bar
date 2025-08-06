"use server";

import { parseWithZod } from "@conform-to/zod/v4";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import {
	RecipeListEntriesTable,
	type RecipeListEntry,
	recipeListEntryFormSchema,
	type UpdateRecipeListEntry,
} from "@/db/schema/recipeListEntries";
import { authOrForbidden } from "@/utils/auth";
import { cacheEvents } from "@/utils/cache";

export async function updateRecipeListEntry(
	id: RecipeListEntry["id"],
	userInputData: UpdateRecipeListEntry,
): Promise<RecipeListEntry> {
	const validatedUserInputData = recipeListEntryFormSchema.parse(userInputData);

	const { orgId } = await authOrForbidden();

	const [result] = await db
		.update(RecipeListEntriesTable)
		.set(validatedUserInputData)
		.where(
			and(
				eq(RecipeListEntriesTable.id, id),
				eq(RecipeListEntriesTable.orgId, orgId),
			),
		)
		.returning();

	cacheEvents.recipeList.update.emit(orgId, result.listId);

	return result;
}

export const updateRecipeListEntryAction = async (
	id: RecipeListEntry["id"],
	formData: FormData,
) => {
	const submission = parseWithZod(formData, {
		schema: recipeListEntryFormSchema,
	});

	if (submission.status !== "success" || !id) {
		return submission.reply();
	}

	/**
	 * Conform converts empty strings to undefined. Convert undefined back to null for
	 * the fields we want to allow users to clear.
	 */
	const patchData = {
		...submission.value,
		price: submission.value.price ?? null,
	};

	const result = await updateRecipeListEntry(id, patchData);

	return result;
};

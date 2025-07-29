"use server";

import { parseWithZod } from "@conform-to/zod/v4";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import {
	RecipeListEntriesTable,
	type RecipeListEntry,
	recipeListEntryFormSchema,
	type UpdateRecipeListEntry,
} from "@/db/schema/recipeListEntries";
import { revalidateRecipeListPaths } from "@/features/lists/utils/server";
import { authOrForbidden } from "@/utils/auth";

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

	revalidateRecipeListPaths({
		id: result.listId,
		shouldRevalidateBar: true,
	});

	/**
	 * This technically only needs to happen if the list it's part of is featured, but
	 * it doesn't seem worth it to query for that info.
	 */
	revalidatePath("/bar", "page");

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

"use server";

import { parseWithZod } from "@conform-to/zod/v4";
import {
	type RecipeListEntry,
	recipeListEntryFormSchema,
	type UpdateRecipeListEntry,
} from "@/db/schema/recipeListEntries";
import { updateRecipeListEntry as updateRecipeListEntryService } from "@/features/lists/entries/api/updateRecipeListEntry.service";
import { authOrForbidden } from "@/utils/auth";

export async function updateRecipeListEntry(
	id: RecipeListEntry["id"],
	userInputData: UpdateRecipeListEntry,
): Promise<RecipeListEntry> {
	const auth = await authOrForbidden();
	return updateRecipeListEntryService(auth, id, userInputData);
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

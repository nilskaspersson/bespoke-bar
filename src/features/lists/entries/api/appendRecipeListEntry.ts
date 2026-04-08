"use server";

import { parseWithZod } from "@conform-to/zod/v4";
import {
	type RecipeListWithEntries,
	type RecipeListWithEntriesFormData,
	recipeListWithEntriesFormSchema,
} from "@/db/schema/composite";
import { appendRecipeListEntry as appendRecipeListEntryService } from "@/features/lists/entries/api/appendRecipeListEntry.service";
import { authOrForbidden } from "@/utils/auth";

export async function appendRecipeListEntry(
	userInputList: RecipeListWithEntriesFormData,
): Promise<RecipeListWithEntries> {
	const auth = await authOrForbidden();
	return appendRecipeListEntryService(auth, userInputList);
}

export async function appendRecipeListEntryAction(formData: FormData) {
	const submission = parseWithZod(formData, {
		schema: recipeListWithEntriesFormSchema,
	});

	if (submission.status !== "success") {
		return submission.reply();
	}

	let result: RecipeListWithEntries;

	try {
		result = await appendRecipeListEntry(submission.value);
	} catch (_error) {
		console.error(_error);

		return submission.reply({
			formErrors: ["Failed to save list"],
		});
	}

	return result;
}

"use server";

import { parseWithZod } from "@conform-to/zod/v4";
import {
	type RecipeListEntry,
	type RecipeListEntryFormData,
	recipeListEntryFormSchema,
} from "@/db/schema/recipeListEntries";
import { addRecipeToList as addRecipeToListService } from "@/features/lists/entries/api/addRecipeToList.service";
import { authOrForbidden } from "@/utils/auth";

export async function addRecipeToList(
	userInput: RecipeListEntryFormData,
): Promise<RecipeListEntry> {
	const auth = await authOrForbidden();
	return addRecipeToListService(auth, userInput);
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

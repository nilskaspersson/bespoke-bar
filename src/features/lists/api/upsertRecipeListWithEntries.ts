"use server";

import { parseWithZod } from "@conform-to/zod/v4";
import { redirect } from "next/navigation";
import {
	type RecipeListWithEntriesFormData,
	recipeListWithEntriesFormSchema,
} from "@/db/schema/composite";
import type { RecipeList } from "@/db/schema/recipeLists";
import { upsertRecipeListWithEntries as upsertRecipeListWithEntriesService } from "@/features/lists/api/upsertRecipeListWithEntries.service";
import { getRecipeListUrl } from "@/features/lists/utils";
import { authOrForbidden } from "@/utils/auth";

export async function upsertRecipeListWithEntries(
	userInputList: RecipeListWithEntriesFormData,
): Promise<RecipeList> {
	const auth = await authOrForbidden();
	return upsertRecipeListWithEntriesService(auth, userInputList);
}

export async function upsertRecipeListWithEntriesAction(formData: FormData) {
	const submission = parseWithZod(formData, {
		schema: recipeListWithEntriesFormSchema,
	});

	if (submission.status !== "success") {
		return submission.reply();
	}

	let result: RecipeList;

	try {
		result = await upsertRecipeListWithEntries(submission.value);
	} catch (_error) {
		console.error(_error);

		return submission.reply({
			formErrors: ["Failed to save list"],
		});
	}

	redirect(getRecipeListUrl(result));
}

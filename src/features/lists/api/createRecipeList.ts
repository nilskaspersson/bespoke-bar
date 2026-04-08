"use server";

import { parseWithZod } from "@conform-to/zod/v4";
import { redirect } from "next/navigation";
import type { RecipeList, RecipeListFormData } from "@/db/schema/recipeLists";
import { recipeListFormSchema } from "@/db/schema/recipeLists";
import { createRecipeList as createRecipeListService } from "@/features/lists/api/createRecipeList.service";
import { getRecipeListUrl } from "@/features/lists/utils";
import { authOrForbidden } from "@/utils/auth";

export async function createRecipeList(
	userInputList: RecipeListFormData,
): Promise<RecipeList> {
	const auth = await authOrForbidden();
	return createRecipeListService(auth, userInputList);
}

export async function createRecipeListAction(
	_prevState: unknown,
	formData: FormData,
) {
	const submission = parseWithZod(formData, {
		schema: recipeListFormSchema,
	});

	if (submission.status !== "success") {
		return submission.reply();
	}

	let result: RecipeList;

	try {
		result = await createRecipeList(submission.value);
	} catch (_error) {
		return submission.reply({
			formErrors: ["Failed to create list"],
		});
	}

	redirect(getRecipeListUrl(result));
}

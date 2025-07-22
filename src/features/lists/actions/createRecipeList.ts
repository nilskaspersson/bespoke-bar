"use server";

import { parseWithZod } from "@conform-to/zod/v4";
import { redirect } from "next/navigation";
import { db } from "@/db";
import {
	insertRecipeListSchema,
	type RecipeList,
	type RecipeListFormData,
	RecipeListsTable,
	recipeListFormSchema,
} from "@/db/schema/recipeLists";
import {
	generateDefaultRecipeListName,
	getRecipeListUrl,
} from "@/features/lists/utils";
import { authOrForbidden } from "@/utils/auth";

export async function createRecipeList(
	userInputList: RecipeListFormData,
): Promise<RecipeList> {
	const { userId, orgId } = await authOrForbidden();

	/**
	 * Use a timestamp as a fallback name
	 * TODO: Move to implementation point for local formatting + schema validation?
	 */
	const name = userInputList?.name || generateDefaultRecipeListName();

	const validatedList = insertRecipeListSchema.parse({
		...userInputList,
		name,
		orgId,
		createdBy: userId,
	});

	const [list] = await db
		.insert(RecipeListsTable)
		.values(validatedList)
		.returning();

	return list;
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

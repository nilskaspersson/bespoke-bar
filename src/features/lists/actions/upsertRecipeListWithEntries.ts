"use server";

import { parseWithZod } from "@conform-to/zod/v4";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import {
	type RecipeListWithEntriesFormData,
	recipeListWithEntriesFormSchema,
} from "@/db/schema/composite";
import type { RecipeList } from "@/db/schema/recipeLists";
import { getRecipeListUrl } from "@/features/lists/utils";
import { revalidateRecipeListPaths } from "@/features/lists/utils/server";
import { authOrForbidden } from "@/utils/auth";
import {
	replaceRecipeListEntriesInTransaction,
	upsertRecipeListInTransaction,
} from "./utils/transactionHelpers";

export async function upsertRecipeListWithEntries(
	userInputList: RecipeListWithEntriesFormData,
): Promise<RecipeList> {
	const { userId, orgId } = await authOrForbidden();

	const result = await db.transaction(async (tx) => {
		const list = await upsertRecipeListInTransaction(
			tx,
			userInputList.recipeList,
			userId,
			orgId,
		);

		await replaceRecipeListEntriesInTransaction(
			tx,
			list.id,
			userInputList.entries,
		);

		return list;
	});

	revalidateRecipeListPaths(result.id);

	if (result.isFeatured) {
		revalidatePath("/bar", "page");
	}

	return result;
}

export async function upsertRecipeListWithEntriesAction(
	_prevState: unknown,
	formData: FormData,
) {
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

"use server";

import { parseWithZod } from "@conform-to/zod/v4";
import { redirect } from "next/navigation";
import { db } from "@/db";
import {
	type RecipeListWithEntriesFormData,
	recipeListWithEntriesFormSchema,
} from "@/db/schema/composite";
import type { RecipeList } from "@/db/schema/recipeLists";
import {
	replaceRecipeListEntriesInTransaction,
	upsertRecipeListInTransaction,
} from "@/features/lists/actions/utils/transactionHelpers";
import { getRecipeListUrl } from "@/features/lists/utils";
import { authOrForbidden } from "@/utils/auth";
import { cacheEvents } from "@/utils/cache";

export async function upsertRecipeListWithEntries(
	userInputList: RecipeListWithEntriesFormData,
): Promise<RecipeList> {
	const { userId, orgId } = await authOrForbidden();

	const [result, isNew] = await db.transaction(async (tx) => {
		const [list, isNew] = await upsertRecipeListInTransaction(
			tx,
			userInputList.recipeList,
			userId,
			orgId,
		);

		await replaceRecipeListEntriesInTransaction(
			tx,
			list.id,
			userInputList.entries,
			orgId,
		);

		return [list, isNew];
	});

	if (isNew) {
		cacheEvents.recipeList.create.emit(orgId);
	} else {
		cacheEvents.recipeList.update.emit(orgId, result.id);
	}

	return result;
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

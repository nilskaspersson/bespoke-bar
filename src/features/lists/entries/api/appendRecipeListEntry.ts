"use server";

import { parseWithZod } from "@conform-to/zod/v4";
import { db } from "@/db";
import {
	type RecipeListWithEntries,
	type RecipeListWithEntriesFormData,
	recipeListWithEntriesFormSchema,
} from "@/db/schema/composite";
import {
	appendRecipeListEntriesInTransaction,
	upsertRecipeListInTransaction,
} from "@/features/lists/api/utils/transactionHelpers";
import { authOrForbidden } from "@/utils/auth";
import { cacheEvents } from "@/utils/cache";

export async function appendRecipeListEntry(
	userInputList: RecipeListWithEntriesFormData,
): Promise<RecipeListWithEntries> {
	const { userId, orgId } = await authOrForbidden();

	const [result, isNew] = await db.transaction(async (tx) => {
		const [list, isNew] = await upsertRecipeListInTransaction(
			tx,
			userInputList.recipeList,
			userId,
			orgId,
		);

		const entries = await appendRecipeListEntriesInTransaction(
			tx,
			list.id,
			userInputList.entries,
			orgId,
		);

		return [{ ...list, entries }, isNew];
	});

	if (isNew) {
		cacheEvents.recipeList.create.emit(orgId);
	} else {
		cacheEvents.recipeList.update.emit(orgId, result.id);
	}

	return result;
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

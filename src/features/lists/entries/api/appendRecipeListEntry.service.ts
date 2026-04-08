import { db } from "@/db";
import type {
	RecipeListWithEntries,
	RecipeListWithEntriesFormData,
} from "@/db/schema/composite";
import {
	appendRecipeListEntriesInTransaction,
	upsertRecipeListInTransaction,
} from "@/features/lists/api/utils/transactionHelpers";
import type { Auth } from "@/utils/auth";
import { cacheEvents } from "@/utils/cache";

export async function appendRecipeListEntry(
	auth: Auth,
	userInputList: RecipeListWithEntriesFormData,
): Promise<RecipeListWithEntries> {
	const { userId, orgId } = auth;

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

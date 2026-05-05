import { db } from "@/db";
import type { RecipeListWithEntriesFormData } from "@/db/schema/composite";
import type { RecipeList } from "@/db/schema/recipeLists";
import {
	replaceRecipeListEntriesInTransaction,
	upsertRecipeListInTransaction,
} from "@/features/lists/api/utils/transactionHelpers";
import { rateLimit } from "@/rateLimit";
import type { Auth } from "@/utils/auth";
import { cacheEvents } from "@/utils/cache";

export async function upsertRecipeListWithEntries(
	auth: Auth,
	userInputList: RecipeListWithEntriesFormData,
): Promise<RecipeList> {
	const { userId, orgId } = auth;

	await rateLimit(userId);

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

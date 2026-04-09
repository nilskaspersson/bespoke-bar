import { db } from "@/db";
import {
	insertRecipeListSchema,
	type RecipeList,
	type RecipeListFormData,
	RecipeListsTable,
} from "@/db/schema/recipeLists";
import { generateDefaultRecipeListName } from "@/features/lists/utils";
import type { Auth } from "@/utils/auth";
import { cacheEvents } from "@/utils/cache";

export async function createRecipeList(
	auth: Auth,
	userInputList: RecipeListFormData,
): Promise<RecipeList> {
	const { userId, orgId } = auth;

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

	cacheEvents.recipeList.create.emit(orgId);

	return list;
}

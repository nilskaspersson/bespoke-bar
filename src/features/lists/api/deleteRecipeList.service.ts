import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { type RecipeList, RecipeListsTable } from "@/db/schema/recipeLists";
import type { Auth } from "@/utils/auth";
import { cacheEvents } from "@/utils/cache";

export async function deleteRecipeList(
	auth: Auth,
	id: RecipeList["id"],
): Promise<void> {
	const { orgId } = auth;

	await db
		.delete(RecipeListsTable)
		.where(and(eq(RecipeListsTable.id, id), eq(RecipeListsTable.orgId, orgId)));

	cacheEvents.recipeList.delete.emit(orgId, id);
}

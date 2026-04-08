import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { type Recipe, RecipesTable } from "@/db/schema/recipes";
import type { Auth } from "@/utils/auth";
import { cacheEvents } from "@/utils/cache";

export async function deleteRecipe(
	auth: Auth,
	id: Recipe["id"],
): Promise<void> {
	const { orgId } = auth;

	await db
		.delete(RecipesTable)
		.where(and(eq(RecipesTable.id, id), eq(RecipesTable.orgId, orgId)));

	cacheEvents.recipe.delete.emit(orgId, id);
}

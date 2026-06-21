import { db } from "@bespoke/db";
import { type Recipe, RecipesTable } from "@bespoke/schema/schema/recipes";
import { and, eq } from "drizzle-orm";
import { rateLimit } from "@/rateLimit";
import type { Auth } from "@/utils/auth";
import { cacheEvents } from "@/utils/cache";

export async function deleteRecipe(
	auth: Auth,
	id: Recipe["id"],
): Promise<void> {
	const { userId, orgId } = auth;

	await rateLimit(userId);

	await db
		.delete(RecipesTable)
		.where(and(eq(RecipesTable.id, id), eq(RecipesTable.orgId, orgId)));

	cacheEvents.recipe.delete.emit(orgId, id);
}

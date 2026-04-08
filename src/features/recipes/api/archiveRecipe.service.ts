import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { type Recipe, RecipesTable } from "@/db/schema/recipes";
import type { Auth } from "@/utils/auth";
import { cacheEvents } from "@/utils/cache";

export async function archiveRecipe(
	auth: Auth,
	id: Recipe["id"],
): Promise<void> {
	const { userId, orgId } = auth;

	await db
		.update(RecipesTable)
		.set({
			archivedAt: sql`NOW()`,
			archivedBy: userId,
		})
		.where(and(eq(RecipesTable.id, id), eq(RecipesTable.orgId, orgId)));

	cacheEvents.recipe.update.emit(orgId, id);
}

export async function unarchiveRecipe(
	auth: Auth,
	id: Recipe["id"],
): Promise<void> {
	const { userId, orgId } = auth;

	await db
		.update(RecipesTable)
		.set({
			archivedAt: null,
			archivedBy: null,
			updatedBy: userId,
			updatedAt: sql`NOW()`,
		})
		.where(and(eq(RecipesTable.id, id), eq(RecipesTable.orgId, orgId)));

	cacheEvents.recipe.update.emit(orgId, id);
}

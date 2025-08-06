import { and, eq, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { type Recipe, RecipesTable } from "@/db/schema/recipes";
import { authOrForbidden } from "@/utils/auth";
import { cacheEvents } from "@/utils/cache";

export async function archiveRecipe({
	id,
	redirectTo,
}: {
	id: Recipe["id"];
	redirectTo?: string;
}): Promise<void> {
	"use server";

	const { userId, orgId } = await authOrForbidden();

	await db
		.update(RecipesTable)
		.set({
			archivedAt: sql`NOW()`,
			archivedBy: userId,
		})
		.where(and(eq(RecipesTable.id, id), eq(RecipesTable.orgId, orgId)));

	cacheEvents.recipe.update.emit(orgId, id);

	if (redirectTo) {
		redirect(redirectTo);
	}
}

export async function unarchiveRecipe({
	id,
	redirectTo,
}: {
	id: Recipe["id"];
	redirectTo?: string;
}): Promise<void> {
	"use server";

	const { userId, orgId } = await authOrForbidden();

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

	if (redirectTo) {
		redirect(redirectTo);
	}
}

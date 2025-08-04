import { and, eq, sql } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { type Recipe, RecipesTable } from "@/db/schema/recipes";
import {
	getRecipesCacheTag,
	revalidateRecipePaths,
} from "@/features/recipes/utils/server";
import { authOrForbidden } from "@/utils/auth";

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

	revalidateTag(getRecipesCacheTag(orgId));
	revalidateRecipePaths([id]);

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

	revalidateTag(getRecipesCacheTag(orgId));
	revalidateRecipePaths([id]);

	if (redirectTo) {
		redirect(redirectTo);
	}
}

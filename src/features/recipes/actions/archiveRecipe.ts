import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { type Recipe, RecipesTable } from "@/db/schema/recipes";
import { revalidateRecipePaths } from "@/features/recipes/utils";
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
			archivedAt: new Date(),
			archivedBy: userId,
		})
		.where(and(eq(RecipesTable.id, id), eq(RecipesTable.orgId, orgId)));

	revalidateRecipePaths(id);

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
			updatedAt: new Date(),
		})
		.where(and(eq(RecipesTable.id, id), eq(RecipesTable.orgId, orgId)));

	revalidateRecipePaths(id);

	if (redirectTo) {
		redirect(redirectTo);
	}
}

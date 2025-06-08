import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { forbidden, redirect } from "next/navigation";
import { db } from "@/db";
import { type Recipe, RecipesTable } from "@/db/schema/recipes";
import { revalidateRecipePaths } from "@/features/recipes/utils";

export async function archiveRecipe({
	id,
	redirectTo,
}: {
	id: Recipe["id"];
	redirectTo?: string;
}): Promise<void> {
	"use server";

	const { userId } = await auth();

	if (!userId) {
		forbidden();
	}

	await db
		.update(RecipesTable)
		.set({
			archivedAt: new Date(),
			archivedBy: userId,
		})
		.where(and(eq(RecipesTable.id, id), eq(RecipesTable.createdBy, userId)));

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

	const { userId } = await auth();

	if (!userId) {
		forbidden();
	}

	await db
		.update(RecipesTable)
		.set({
			archivedAt: null,
			archivedBy: null,
			updatedBy: userId,
			updatedAt: new Date(),
		})
		.where(and(eq(RecipesTable.id, id), eq(RecipesTable.createdBy, userId)));

	revalidateRecipePaths(id);

	if (redirectTo) {
		redirect(redirectTo);
	}
}

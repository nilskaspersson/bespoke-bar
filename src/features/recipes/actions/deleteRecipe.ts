import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { forbidden, redirect } from "next/navigation";
import { db } from "@/db";
import { type Recipe, RecipesTable } from "@/db/schema/recipes";
import { revalidateRecipePaths } from "@/features/recipes/utils";

export async function deleteRecipe({
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
		.delete(RecipesTable)
		.where(and(eq(RecipesTable.id, id), eq(RecipesTable.createdBy, userId)));

	revalidateRecipePaths(id);

	if (redirectTo) {
		redirect(redirectTo);
	}
}

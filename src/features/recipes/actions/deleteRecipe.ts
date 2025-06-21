import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { type Recipe, RecipesTable } from "@/db/schema/recipes";
import { revalidateRecipePaths } from "@/features/recipes/utils/server";
import { authOrForbidden } from "@/utils/auth";

export async function deleteRecipe({
	id,
	redirectTo,
}: {
	id: Recipe["id"];
	redirectTo?: string;
}): Promise<void> {
	"use server";

	const { orgId } = await authOrForbidden();

	await db
		.delete(RecipesTable)
		.where(and(eq(RecipesTable.id, id), eq(RecipesTable.orgId, orgId)));

	revalidateRecipePaths(id);

	if (redirectTo) {
		redirect(redirectTo);
	}
}

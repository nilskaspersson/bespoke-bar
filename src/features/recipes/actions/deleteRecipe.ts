"use server";

import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { type Recipe, RecipesTable } from "@/db/schema/recipes";
import { authOrForbidden } from "@/utils/auth";
import { cacheEvents } from "@/utils/cache";

export async function deleteRecipe({
	id,
	redirectTo,
}: {
	id: Recipe["id"];
	redirectTo?: string;
}): Promise<void> {
	const { orgId } = await authOrForbidden();

	await db
		.delete(RecipesTable)
		.where(and(eq(RecipesTable.id, id), eq(RecipesTable.orgId, orgId)));

	cacheEvents.recipe.delete.emit(orgId, id);

	if (redirectTo) {
		redirect(redirectTo);
	}
}

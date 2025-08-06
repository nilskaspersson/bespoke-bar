"use server";

import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { type RecipeList, RecipeListsTable } from "@/db/schema/recipeLists";
import { authOrForbidden } from "@/utils/auth";
import { cacheEvents } from "@/utils/cache";

export async function deleteRecipeList({
	id,
	redirectTo,
}: {
	id: RecipeList["id"];
	redirectTo?: string;
}): Promise<void> {
	const { orgId } = await authOrForbidden();

	await db
		.delete(RecipeListsTable)
		.where(and(eq(RecipeListsTable.id, id), eq(RecipeListsTable.orgId, orgId)));

	cacheEvents.recipeList.delete.emit(orgId, id);

	if (redirectTo) {
		redirect(redirectTo);
	}
}

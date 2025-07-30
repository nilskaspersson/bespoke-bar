"use server";

import { and, eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { type RecipeList, RecipeListsTable } from "@/db/schema/recipeLists";
import {
	getRecipeListCacheTag,
	revalidateRecipeListPaths,
} from "@/features/lists/utils/server";
import { authOrForbidden } from "@/utils/auth";

export async function deleteRecipeList({
	id,
	redirectTo,
}: {
	id: RecipeList["id"];
	redirectTo?: string;
}): Promise<void> {
	const { orgId } = await authOrForbidden();

	const [result] = await db
		.delete(RecipeListsTable)
		.where(and(eq(RecipeListsTable.id, id), eq(RecipeListsTable.orgId, orgId)))
		.returning();

	revalidateRecipeListPaths({
		id,
		shouldRevalidateBar: result.isFeatured,
	});

	revalidateTag(getRecipeListCacheTag(orgId));

	if (redirectTo) {
		redirect(redirectTo);
	}
}

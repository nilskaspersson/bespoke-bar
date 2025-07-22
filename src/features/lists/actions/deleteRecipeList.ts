"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { type RecipeList, RecipeListsTable } from "@/db/schema/recipeLists";
import { revalidateRecipeListPaths } from "@/features/lists/utils/server";
import { authOrForbidden } from "@/utils/auth";

export async function deleteRecipeList({
	id,
	redirectTo,
}: {
	id: RecipeList["id"];
	redirectTo?: string;
}): Promise<void> {
	const { orgId } = await authOrForbidden();

	const result = await db
		.delete(RecipeListsTable)
		.where(and(eq(RecipeListsTable.id, id), eq(RecipeListsTable.orgId, orgId)))
		.returning();

	revalidateRecipeListPaths(id);

	if (result.some((o) => o.isFeatured)) {
		revalidatePath("/bar", "page");
	}

	if (redirectTo) {
		redirect(redirectTo);
	}
}

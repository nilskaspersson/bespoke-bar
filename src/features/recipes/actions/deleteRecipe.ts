"use server";

import { and, eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { type Recipe, RecipesTable } from "@/db/schema/recipes";
import {
	getRecipesCacheTag,
	revalidateRecipePaths,
} from "@/features/recipes/utils/server";
import { authOrForbidden } from "@/utils/auth";

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

	revalidateRecipePaths([id]);
	revalidateTag(getRecipesCacheTag(orgId));

	if (redirectTo) {
		redirect(redirectTo);
	}
}

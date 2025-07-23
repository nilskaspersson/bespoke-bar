"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { RecipeListsTable } from "@/db/schema/recipeLists";
import { revalidateRecipeListPaths } from "@/features/lists/utils/server";
import { authOrForbidden } from "@/utils/auth";

export async function clearFeaturedList() {
	const { orgId } = await authOrForbidden();

	const [list] = await db
		.update(RecipeListsTable)
		.set({
			isFeatured: false,
			featuredAt: null,
		})
		.where(
			and(
				eq(RecipeListsTable.orgId, orgId),
				eq(RecipeListsTable.isFeatured, true),
			),
		)
		.returning();

	revalidatePath("/bar", "page");
	revalidateRecipeListPaths(list.id);
}

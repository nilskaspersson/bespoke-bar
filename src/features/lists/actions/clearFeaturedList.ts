"use server";

import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { RecipeListsTable } from "@/db/schema/recipeLists";
import { authOrForbidden } from "@/utils/auth";
import { cacheEvents } from "@/utils/cache";

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

	cacheEvents.recipeList.update.emit(orgId, list.id);

	return list;
}

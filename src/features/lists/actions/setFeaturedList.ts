"use server";

import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { type RecipeList, RecipeListsTable } from "@/db/schema/recipeLists";
import { authOrForbidden } from "@/utils/auth";
import { cacheEvents } from "@/utils/cache";

export async function setFeaturedList(listId: RecipeList["id"]) {
	const { orgId } = await authOrForbidden();

	const [prev, next] = await db.transaction(async (tx) => {
		const [prev] = await tx
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

		const [next] = await tx
			.update(RecipeListsTable)
			.set({
				isFeatured: true,
				featuredAt: sql`NOW()`,
			})
			.where(
				and(eq(RecipeListsTable.id, listId), eq(RecipeListsTable.orgId, orgId)),
			)
			.returning();

		return [prev, next];
	});

	cacheEvents.recipeList.update.emit(orgId, next.id);

	if (prev) {
		cacheEvents.recipeList.update.emit(orgId, prev.id);
	}

	return next;
}

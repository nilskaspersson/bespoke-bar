import { TRPCError } from "@trpc/server";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { type RecipeList, RecipeListsTable } from "@/db/schema/recipeLists";
import type { Auth } from "@/utils/auth";
import { cacheEvents } from "@/utils/cache";

export async function setFeaturedList(auth: Auth, listId: RecipeList["id"]) {
	const { orgId } = auth;

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

	if (!next) {
		throw new TRPCError({
			code: "NOT_FOUND",
			message: "List not found",
		});
	}

	cacheEvents.recipeList.update.emit(orgId, next.id);

	if (prev) {
		cacheEvents.recipeList.update.emit(orgId, prev.id);
	}

	return next;
}

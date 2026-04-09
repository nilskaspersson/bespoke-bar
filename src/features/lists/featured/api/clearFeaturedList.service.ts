import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { RecipeListsTable } from "@/db/schema/recipeLists";
import type { Auth } from "@/utils/auth";
import { cacheEvents } from "@/utils/cache";

export async function clearFeaturedList(auth: Auth) {
	const { orgId } = auth;

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

	if (list) {
		cacheEvents.recipeList.update.emit(orgId, list.id);
	}

	return list ?? null;
}

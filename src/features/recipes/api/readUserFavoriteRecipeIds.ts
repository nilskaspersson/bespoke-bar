import { and, eq, sql } from "drizzle-orm";
import { cacheTag } from "next/cache";
import { db } from "@/db";
import { RecipeFavoritesTable } from "@/db/schema/recipeFavorites";
import { cacheTags } from "@/utils/cache";

const preparedReadUserFavoriteRecipeIds = db
	.select({ recipeId: RecipeFavoritesTable.recipeId })
	.from(RecipeFavoritesTable)
	.where(
		and(
			eq(RecipeFavoritesTable.userId, sql.placeholder("userId")),
			eq(RecipeFavoritesTable.orgId, sql.placeholder("orgId")),
		),
	)
	.prepare("readUserFavoriteRecipeIds");

export async function readUserFavoriteRecipeIds(orgId: string, userId: string) {
	const favoriteRecipes = await preparedReadUserFavoriteRecipeIds.execute({
		orgId,
		userId,
	});
	return favoriteRecipes.map((r) => r.recipeId);
}

export async function getCachedUserFavoriteRecipeIds(
	orgId: string,
	userId: string,
) {
	"use cache";
	cacheTag(...cacheTags.favorite.toggle(orgId, userId));
	return await readUserFavoriteRecipeIds(orgId, userId);
}

"use server";

import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { RecipeFavoritesTable } from "@/db/schema/recipeFavorites";
import { authOrForbidden } from "@/utils/auth";
import { cacheEvents } from "@/utils/cache";

export async function toggleRecipeFavorite(recipeId: string) {
	const { userId, orgId } = await authOrForbidden();

	const existingFavorite = await db.query.RecipeFavoritesTable.findFirst({
		where: and(
			eq(RecipeFavoritesTable.userId, userId),
			eq(RecipeFavoritesTable.recipeId, recipeId),
			eq(RecipeFavoritesTable.orgId, orgId),
		),
	});

	if (existingFavorite) {
		await db
			.delete(RecipeFavoritesTable)
			.where(eq(RecipeFavoritesTable.id, existingFavorite.id));
	} else {
		await db.insert(RecipeFavoritesTable).values({
			recipeId,
			userId,
			orgId,
		});
	}

	cacheEvents.favorite.toggle.emit(orgId, userId);

	return { favorited: !existingFavorite };
}

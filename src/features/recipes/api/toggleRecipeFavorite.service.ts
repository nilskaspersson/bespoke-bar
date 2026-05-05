import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { RecipeFavoritesTable } from "@/db/schema/recipeFavorites";
import { rateLimit } from "@/rateLimit";
import type { Auth } from "@/utils/auth";
import { cacheEvents } from "@/utils/cache";

export async function toggleRecipeFavorite(auth: Auth, recipeId: string) {
	await rateLimit(auth.userId);

	const { userId, orgId } = auth;

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

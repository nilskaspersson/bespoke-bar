import { db } from "@bespoke/db";
import { RecipeFavoritesTable } from "@bespoke/schema/schema/recipeFavorites";
import { and, eq } from "drizzle-orm";
import type { Auth } from "../auth";
import { cacheEvents } from "../cache";
import { rateLimit } from "../rateLimit";

export async function toggleRecipeFavorite(auth: Auth, recipeId: string) {
	const { userId, orgId } = auth;

	await rateLimit(userId);

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
			.where(
				and(
					eq(RecipeFavoritesTable.orgId, orgId),
					eq(RecipeFavoritesTable.userId, userId),
					eq(RecipeFavoritesTable.recipeId, recipeId),
				),
			);
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

import { db } from "@bespoke/db";
import { isForeignKeyViolation } from "@bespoke/db/utils";
import { IngredientLinesTable } from "@bespoke/schema/schema/ingredientLines";
import { IngredientsTable } from "@bespoke/schema/schema/ingredients";
import { and, countDistinct, eq } from "drizzle-orm";
import { rateLimit } from "@/rateLimit";
import { AppError } from "@/utils/appError";
import type { Auth } from "@/utils/auth";
import { cacheEvents } from "@/utils/cache";

export async function deleteIngredient(auth: Auth, id: string): Promise<void> {
	const { userId, orgId } = auth;

	await rateLimit(userId);

	try {
		await db
			.delete(IngredientsTable)
			.where(
				and(eq(IngredientsTable.id, id), eq(IngredientsTable.orgId, orgId)),
			);
	} catch (error) {
		/**
		 * An in-use Ingredient can't be deleted. Surface a typed error.
		 */
		if (isForeignKeyViolation(error)) {
			const [{ recipeCount }] = await db
				.select({ recipeCount: countDistinct(IngredientLinesTable.recipeId) })
				.from(IngredientLinesTable)
				.where(eq(IngredientLinesTable.ingredientId, id));

			throw new AppError({
				code: "INGREDIENT_IN_USE",
				recipeCount: Math.max(1, recipeCount),
			});
		}
		throw error;
	}

	cacheEvents.ingredient.delete.emit(orgId, id);
}

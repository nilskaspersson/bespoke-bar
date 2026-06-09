import { and, countDistinct, eq } from "drizzle-orm";
import { db } from "@/db";
import { IngredientsTable } from "@/db/schema/ingredients";
import { SpecsTable } from "@/db/schema/specs";
import { isForeignKeyViolation } from "@/db/utils";
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
				.select({ recipeCount: countDistinct(SpecsTable.recipeId) })
				.from(SpecsTable)
				.where(eq(SpecsTable.ingredientId, id));

			throw new AppError({
				code: "INGREDIENT_IN_USE",
				recipeCount: Math.max(1, recipeCount),
			});
		}
		throw error;
	}

	cacheEvents.ingredient.delete.emit(orgId, id);
}

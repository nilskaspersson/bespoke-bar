import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { IngredientsTable } from "@/db/schema/ingredients";
import { SpecsTable } from "@/db/schema/specs";
import { getCachedIngredient } from "@/features/ingredients/api/readIngredient";
import { rateLimit } from "@/rateLimit";
import { AppError } from "@/utils/appError";
import type { Auth } from "@/utils/auth";
import { cacheEvents } from "@/utils/cache";

export async function deleteIngredient(auth: Auth, id: string): Promise<void> {
	const { userId, orgId } = auth;

	await rateLimit(userId);

	// SpecsTable has no orgId; gate the usage probe on org-scoped ownership.
	if (!(await getCachedIngredient(orgId, id))) {
		return;
	}

	const usages = await db
		.select({ recipeId: SpecsTable.recipeId })
		.from(SpecsTable)
		.where(eq(SpecsTable.ingredientId, id));

	const recipeCount = new Set(usages.map((usage) => usage.recipeId)).size;

	if (recipeCount > 0) {
		throw new AppError({ code: "INGREDIENT_IN_USE", recipeCount });
	}

	await db
		.delete(IngredientsTable)
		.where(and(eq(IngredientsTable.id, id), eq(IngredientsTable.orgId, orgId)));

	cacheEvents.ingredient.delete.emit(orgId, id);
}

import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import type { DraftIngredient, Ingredient } from "@/db/schema/ingredients";
import {
	IngredientsTable,
	updateIngredientSchema,
} from "@/db/schema/ingredients";
import { getCachedIngredient } from "@/features/ingredients/api/readIngredient";
import { ingredientEnrichmentSchema } from "@/features/ingredients/utils/getIngredientMetaDataWithLLM";
import { rateLimit } from "@/rateLimit";
import { isEmpty } from "@/utils";
import type { Auth } from "@/utils/auth";
import { cacheEvents } from "@/utils/cache";

const aiEnrichedFieldsSchema = z
	.array(ingredientEnrichmentSchema.keyof())
	.nullish();

export async function updateIngredient(
	auth: Auth,
	id: string,
	userInputIngredient: Partial<DraftIngredient>,
): Promise<Ingredient> {
	const { userId, orgId } = auth;

	await rateLimit(userId);

	const validatedInput = updateIngredientSchema.parse(userInputIngredient);

	const current = await getCachedIngredient(orgId, id);

	if (!current) {
		throw new Error("Ingredient not found");
	}

	const aiFields = aiEnrichedFieldsSchema.parse(current.aiEnrichedFields) ?? [];
	const aiEnrichedFields = aiFields.filter((k) => isEmpty(validatedInput[k]));

	const [result] = await db
		.update(IngredientsTable)
		.set({
			...validatedInput,
			aiEnrichedFields: aiEnrichedFields.length > 0 ? aiEnrichedFields : null,
			updatedAt: sql`NOW()`,
			updatedBy: userId,
		})
		.where(and(eq(IngredientsTable.id, id), eq(IngredientsTable.orgId, orgId)))
		.returning();

	cacheEvents.ingredient.update.emit(orgId, id);

	return result;
}

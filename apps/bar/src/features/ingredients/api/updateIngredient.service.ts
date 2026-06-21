import { normalizeIngredientName } from "@bespoke/schema/normalizeIngredientName";
import { percentageToRatioSchema } from "@bespoke/schema/percentageToRatio";
import type {
	DraftIngredient,
	Ingredient,
} from "@bespoke/schema/schema/ingredients";
import {
	IngredientsTable,
	updateIngredientSchema,
} from "@bespoke/schema/schema/ingredients";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { getCachedIngredient } from "@/features/ingredients/api/readIngredient";
import { ingredientEnrichmentSchema } from "@/features/ingredients/utils/getIngredientMetaDataWithLLM";
import { rateLimit } from "@/rateLimit";
import { clearTouchedAiMarks } from "@/utils/aiEnrichedFields";
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

	const parsedMarks = aiEnrichedFieldsSchema.safeParse(
		current.aiEnrichedFields,
	);
	const markedFields = parsedMarks.success ? (parsedMarks.data ?? []) : [];
	/**
	 * Compare abv in the form's space: its parser rounds to the precision a user
	 * can enter, so the stored value (a `real` column, full float32 precision)
	 * isn't read as an edit when the same value is resubmitted.
	 */
	const toFormAbv = (abv: number | null | undefined) =>
		abv == null ? abv : percentageToRatioSchema.parse(`${abv * 100}`);
	const aiEnrichedFields = clearTouchedAiMarks(
		markedFields,
		{ ...current, abv: toFormAbv(current.abv) },
		{ ...validatedInput, abv: toFormAbv(validatedInput.abv) },
	);

	const [result] = await db
		.update(IngredientsTable)
		.set({
			...validatedInput,
			/** Keep the identity key in sync whenever the name is edited. */
			...(validatedInput.name != null && {
				normalizedName: normalizeIngredientName(validatedInput.name),
			}),
			aiEnrichedFields,
			updatedAt: sql`NOW()`,
			updatedBy: userId,
		})
		.where(and(eq(IngredientsTable.id, id), eq(IngredientsTable.orgId, orgId)))
		.returning();

	cacheEvents.ingredient.update.emit(orgId, id);

	return result;
}

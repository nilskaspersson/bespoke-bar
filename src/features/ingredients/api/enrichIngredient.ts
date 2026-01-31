import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { type Ingredient, IngredientsTable } from "@/db/schema/ingredients";
import { CATEGORY_DEFAULT_ABV } from "@/features/categories/constants";
import {
	getIngredientMetaDataBatchWithLLM,
	type IngredientEnrichment,
	ingredientEnrichmentSchema,
} from "@/features/ingredients/utils/getIngredientMetaDataWithLLM";
import { isEmpty } from "@/utils";
import { cacheEvents } from "@/utils/cache";

const ENRICHABLE_FIELDS = ingredientEnrichmentSchema.keyof().options;

/**
 * Apply enrichment data to an ingredient, updating only empty fields.
 * Returns the updates to apply, or null if no updates needed.
 */
function buildEnrichmentUpdates(
	ingredient: Ingredient,
	enrichment: IngredientEnrichment,
): {
	updates: Partial<IngredientEnrichment>;
	aiEnrichedFields: string[];
} | null {
	const aiEnrichedFields = ENRICHABLE_FIELDS.filter((key) => {
		const current = ingredient[key];
		const enriched = enrichment[key];

		return isEmpty(current) && !isEmpty(enriched);
	});

	if (aiEnrichedFields.length === 0) {
		return null;
	}

	const updates = ingredientEnrichmentSchema
		.partial()
		.parse(Object.fromEntries(aiEnrichedFields.map((f) => [f, enrichment[f]])));

	return { updates, aiEnrichedFields };
}

/**
 * Enrich ingredients with LLM-generated data.
 * Uses a single LLM call for efficiency, only updates fields that are currently empty.
 *
 * @param orgId - The organization ID (for cache invalidation)
 * @param ingredients - The ingredients to enrich (single or array)
 * @returns Number of ingredients that were updated
 */
export async function enrichIngredients(
	orgId: string,
	ingredients: Ingredient | Ingredient[],
): Promise<number> {
	const ingredientArray = Array.isArray(ingredients)
		? ingredients
		: [ingredients];

	if (ingredientArray.length === 0) {
		return 0;
	}

	const enrichmentsByName = await getIngredientMetaDataBatchWithLLM(
		ingredientArray.map((i) => i.name),
	);

	if (enrichmentsByName.size === 0) {
		return 0;
	}

	let updatedCount = 0;

	for (const ingredient of ingredientArray) {
		const enrichment = enrichmentsByName.get(ingredient.name);

		if (!enrichment) continue;

		/**
		 * Use category default ABV if LLM found a category but no ABV
		 */
		if (enrichment.abv == null && enrichment.category) {
			enrichment.abv = CATEGORY_DEFAULT_ABV.get(enrichment.category) ?? null;
		}

		const result = buildEnrichmentUpdates(ingredient, enrichment);

		if (!result) continue;

		await db
			.update(IngredientsTable)
			.set({ ...result.updates, aiEnrichedFields: result.aiEnrichedFields })
			.where(
				and(
					eq(IngredientsTable.id, ingredient.id),
					eq(IngredientsTable.orgId, orgId),
				),
			);

		cacheEvents.ingredient.update.emit(orgId, ingredient.id);
		updatedCount++;
	}

	return updatedCount;
}

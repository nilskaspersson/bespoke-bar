import { db } from "@bespoke/db";
import { CATEGORY_DEFAULT_ABV } from "@bespoke/domain/categories/constants";
import {
	type Ingredient,
	IngredientsTable,
} from "@bespoke/schema/schema/ingredients";
import { and, eq, inArray, type SQL, sql } from "drizzle-orm";
import {
	getIngredientMetaDataBatchWithLLM,
	ingredientEnrichmentSchema,
} from "@/features/ingredients/utils/getIngredientMetaDataWithLLM";
import { isEmpty } from "@/utils";
import { cacheEvents } from "@/utils/cache";
import { reserveEnrichmentBudget } from "@/utils/enrichmentQuota";

const ENRICHABLE_FIELDS = ingredientEnrichmentSchema.keyof().options;
const MAX_ENRICHMENT_BATCH_SIZE = 50;

type PendingUpdate = {
	id: string;
	description: string | null;
	brand: string | null;
	abv: number | null;
	category: string | null;
	measurementType: string;
	aiEnrichedFields: string[];
};

/**
 * Build a SQL CASE statement for batch updates with different values per row.
 * @see https://orm.drizzle.team/docs/guides/update-many-with-different-value
 */
function buildCaseStatement<T>(
	updates: PendingUpdate[],
	field: keyof PendingUpdate,
	cast?: string,
): SQL {
	const chunks: SQL[] = [sql`(case`];

	for (const update of updates) {
		const value = update[field];

		if (Array.isArray(value)) {
			const arrayElements = sql.join(
				value.map((v) => sql`${v}`),
				sql`, `,
			);
			chunks.push(
				sql`when ${IngredientsTable.id} = ${update.id} then ARRAY[${arrayElements}]`,
			);
		} else {
			chunks.push(
				sql`when ${IngredientsTable.id} = ${update.id} then ${value as T}`,
			);
		}
	}

	chunks.push(sql`end)`);

	const caseExpr = sql.join(chunks, sql.raw(" "));

	return cast ? sql`${caseExpr}::${sql.raw(cast)}` : caseExpr;
}

/**
 * Enrich newly created ingredients with LLM-generated data.
 * Uses a single LLM call and single batch UPDATE for efficiency.
 * Only fills fields that the user left empty at creation time.
 * Limited to first 50 ingredients to maintain LLM attention.
 *
 * @param orgId
 * @param ingredients - Newly created ingredients to enrich
 * @returns Number of ingredients that were updated
 */
export async function enrichIngredients(
	orgId: string,
	ingredients: Ingredient | Ingredient[],
): Promise<number> {
	if (process.env.DISABLE_INGREDIENT_ENRICHMENT === "true") {
		return 0;
	}

	const allIngredients = Array.isArray(ingredients)
		? ingredients
		: [ingredients];
	const ingredientArray = allIngredients.slice(0, MAX_ENRICHMENT_BATCH_SIZE);

	if (ingredientArray.length === 0) {
		return 0;
	}

	if (!(await reserveEnrichmentBudget(orgId, ingredientArray.length))) {
		if (process.env.NODE_ENV === "development") {
			console.info(
				"[ingredient-enrichment] skipped — enrichment quota reached",
				JSON.stringify({ orgId, items: ingredientArray.length }),
			);
		}
		return 0;
	}

	const enrichmentsByName = await getIngredientMetaDataBatchWithLLM(
		ingredientArray.map((i) => i.name),
	);

	if (enrichmentsByName.size === 0) {
		return 0;
	}

	const pendingUpdates: PendingUpdate[] = [];

	for (const ingredient of ingredientArray) {
		const enrichment = enrichmentsByName.get(ingredient.name);

		if (!enrichment) {
			continue;
		}

		/**
		 * Use category default ABV if LLM found a category but no ABV
		 */
		if (enrichment.abv == null && enrichment.category) {
			enrichment.abv = CATEGORY_DEFAULT_ABV.get(enrichment.category) ?? null;
		}

		/**
		 * Track which fields are being enhanced.
		 */
		const aiEnrichedFields = ENRICHABLE_FIELDS.filter(
			(key) => isEmpty(ingredient[key]) && !isEmpty(enrichment[key]),
		);

		if (aiEnrichedFields.length === 0) {
			continue;
		}

		/**
		 * Keep user values, fill empty fields with enrichment.
		 * Default measurementType to "volume" if LLM didn't provide one.
		 */
		pendingUpdates.push({
			id: ingredient.id,
			description: ingredient.description || enrichment.description,
			brand: ingredient.brand || enrichment.brand,
			abv: ingredient.abv || enrichment.abv,
			category: ingredient.category || enrichment.category,
			measurementType:
				ingredient.measurementType || enrichment.measurementType || "volume",
			aiEnrichedFields,
		});
	}

	if (pendingUpdates.length === 0) {
		return 0;
	}

	const ids = pendingUpdates.map((u) => u.id);

	await db
		.update(IngredientsTable)
		.set({
			description: buildCaseStatement(pendingUpdates, "description"),
			brand: buildCaseStatement(pendingUpdates, "brand"),
			abv: buildCaseStatement(pendingUpdates, "abv", "real"),
			category: buildCaseStatement(
				pendingUpdates,
				"category",
				"system_category",
			),
			measurementType: buildCaseStatement(
				pendingUpdates,
				"measurementType",
				"measurement_type",
			),
			aiEnrichedFields: buildCaseStatement(
				pendingUpdates,
				"aiEnrichedFields",
				"text[]",
			),
		})
		.where(
			and(inArray(IngredientsTable.id, ids), eq(IngredientsTable.orgId, orgId)),
		);

	for (const { id } of pendingUpdates) {
		cacheEvents.ingredient.update.emit(orgId, id);
	}

	return pendingUpdates.length;
}

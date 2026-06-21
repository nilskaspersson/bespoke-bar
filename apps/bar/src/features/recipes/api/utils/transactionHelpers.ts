import { normalizeIngredientName } from "@bespoke/schema/normalizeIngredientName";
import type { RecipeFormData } from "@bespoke/schema/schema/composite";
import {
	type IngredientLine,
	IngredientLinesTable,
	type InsertIngredientLine,
} from "@bespoke/schema/schema/ingredientLines";
import {
	type Ingredient,
	IngredientsTable,
	type InsertIngredient,
} from "@bespoke/schema/schema/ingredients";
import { type Recipe, RecipesTable } from "@bespoke/schema/schema/recipes";
import { and, eq, inArray, sql } from "drizzle-orm";
import type { DatabaseTransaction } from "@/db";
import { clearTouchedAiMarks } from "@/features/recipes/api/utils/aiEnrichedFields";

/** Keyed by {@link normalizeIngredientName} — i.e. the stored `normalized_name`. */
export type IngredientIdsByName = Map<string, Ingredient["id"]>;

export async function upsertRecipeInTransaction(
	tx: DatabaseTransaction,
	recipe: RecipeFormData["recipe"],
	userId: string,
	orgId: string,
): Promise<[Recipe, boolean]> {
	/**
	 * Update existing recipe if request includes a recipe with an id
	 */
	if (recipe?.id) {
		const [current] = await tx
			.select({
				aiEnrichedFields: RecipesTable.aiEnrichedFields,
				style: RecipesTable.style,
				glassware: RecipesTable.glassware,
				ice: RecipesTable.ice,
				preparationMethod: RecipesTable.preparationMethod,
			})
			.from(RecipesTable)
			.where(
				and(eq(RecipesTable.id, recipe.id), eq(RecipesTable.orgId, orgId)),
			);

		const [updatedRecipe] = await tx
			.update(RecipesTable)
			.set({
				...recipe,
				aiEnrichedFields: clearTouchedAiMarks(
					current?.aiEnrichedFields,
					current ?? {},
					recipe,
				),
				updatedBy: userId,
				updatedAt: sql`NOW()`,
			})
			.where(and(eq(RecipesTable.id, recipe.id), eq(RecipesTable.orgId, orgId)))
			.returning();

		return [updatedRecipe, false];
	}

	/**
	 * Otherwise, create a new recipe
	 */
	const [newRecipe] = await tx
		.insert(RecipesTable)
		.values({
			...recipe,
			createdBy: userId,
			orgId,
		})
		.returning();

	return [newRecipe, true];
}

/**
 * Find-or-reference for the new ingredients a recipe save introduces. Inserts the
 * genuinely-new ones and lets the case-insensitive unique index absorb any that
 * already exist.
 */
export async function insertIngredientsInTransaction(
	tx: DatabaseTransaction,
	ingredients: InsertIngredient[],
	orgId: string,
): Promise<[IngredientIdsByName, Ingredient[]]> {
	const ingredientIdsByName: IngredientIdsByName = new Map();

	if (ingredients.length === 0) {
		return [ingredientIdsByName, []];
	}

	const createdIngredients = await tx
		.insert(IngredientsTable)
		.values(ingredients)
		.onConflictDoNothing()
		.returning();

	const normalizedNames = ingredients.map((ingredient) =>
		normalizeIngredientName(ingredient.name),
	);

	const rows = await tx
		.select({
			id: IngredientsTable.id,
			normalizedName: IngredientsTable.normalizedName,
		})
		.from(IngredientsTable)
		.where(
			and(
				eq(IngredientsTable.orgId, orgId),
				inArray(IngredientsTable.normalizedName, normalizedNames),
			),
		);

	rows.forEach((row) => {
		if (row.normalizedName) {
			ingredientIdsByName.set(row.normalizedName, row.id);
		}
	});

	return [ingredientIdsByName, createdIngredients];
}

/**
 * Replace all lines for a recipe using the "replace all approach"
 * 1. Delete all existing lines for the recipe
 * 2. Insert all new lines from the form
 */
export async function replaceLinesInTransaction(
	tx: DatabaseTransaction,
	recipeId: string,
	lines: RecipeFormData["lines"],
	ingredientIdsByName: IngredientIdsByName,
): Promise<IngredientLine[] | null> {
	if (!lines) {
		return null;
	}

	await tx
		.delete(IngredientLinesTable)
		.where(eq(IngredientLinesTable.recipeId, recipeId));

	if (lines.length === 0) {
		return [];
	}

	const linesToInsert: InsertIngredientLine[] = lines.map((line, index) => {
		const ingredientId =
			line.ingredientId ??
			ingredientIdsByName.get(
				normalizeIngredientName(line.ingredient?.name ?? ""),
			);

		if (!ingredientId) {
			throw new Error(
				`Invalid ingredient reference for line at index ${index}`,
			);
		}

		return {
			recipeId,
			quantity: line.quantity,
			unit: line.unit,
			optional: line.optional,
			ingredientId,
		};
	});

	const insertedLines = await tx
		.insert(IngredientLinesTable)
		.values(linesToInsert)
		.returning();

	return insertedLines;
}

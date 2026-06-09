import { and, eq, inArray, sql } from "drizzle-orm";
import type { DatabaseTransaction } from "@/db";
import type { RecipeFormData } from "@/db/schema/composite";
import {
	type Ingredient,
	IngredientsTable,
	type InsertIngredient,
} from "@/db/schema/ingredients";
import { type Recipe, RecipesTable } from "@/db/schema/recipes";
import { type InsertSpec, type Spec, SpecsTable } from "@/db/schema/specs";
import { clearTouchedAiMarks } from "@/features/recipes/api/utils/aiEnrichedFields";
import { normalizeIngredientName } from "@/utils/normalizeIngredientName";

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
 * Replace all specs for a recipe using the "replace all approach"
 * 1. Delete all existing specs for the recipe
 * 2. Insert all new specs from the form
 */
export async function replaceSpecsInTransaction(
	tx: DatabaseTransaction,
	recipeId: string,
	specs: RecipeFormData["specs"],
	ingredientIdsByName: IngredientIdsByName,
): Promise<Spec[] | null> {
	if (!specs) {
		return null;
	}

	await tx.delete(SpecsTable).where(eq(SpecsTable.recipeId, recipeId));

	if (specs.length === 0) {
		return [];
	}

	const specsToInsert: InsertSpec[] = specs.map((spec, index) => {
		const ingredientId =
			spec.ingredientId ??
			ingredientIdsByName.get(
				normalizeIngredientName(spec.ingredient?.name ?? ""),
			);

		if (!ingredientId) {
			throw new Error(
				`Invalid ingredient reference for spec at index ${index}`,
			);
		}

		return {
			recipeId,
			quantity: spec.quantity,
			unit: spec.unit,
			optional: spec.optional,
			ingredientId,
		};
	});

	const insertedSpecs = await tx
		.insert(SpecsTable)
		.values(specsToInsert)
		.returning();

	return insertedSpecs;
}

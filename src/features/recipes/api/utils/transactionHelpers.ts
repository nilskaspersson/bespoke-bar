import { and, eq, sql } from "drizzle-orm";
import type { DatabaseTransaction } from "@/db";
import type { RecipeFormData } from "@/db/schema/composite";
import {
	type Ingredient,
	IngredientsTable,
	type InsertIngredient,
} from "@/db/schema/ingredients";
import { type Recipe, RecipesTable } from "@/db/schema/recipes";
import { type InsertSpec, type Spec, SpecsTable } from "@/db/schema/specs";

export type IngredientNameToIdMap = Map<Ingredient["name"], Ingredient["id"]>;

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
		const [updatedRecipe] = await tx
			.update(RecipesTable)
			.set({
				...recipe,
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

export async function insertIngredientsInTransaction(
	tx: DatabaseTransaction,
	ingredients: InsertIngredient[],
): Promise<IngredientNameToIdMap> {
	const createdIngredientNameToId: IngredientNameToIdMap = new Map();

	if (ingredients.length > 0) {
		const ingredientsToInsert = Array.from(ingredients.values());

		const createdIngredients = await tx
			.insert(IngredientsTable)
			.values(ingredientsToInsert)
			.returning();

		createdIngredients.forEach((ingredient) => {
			createdIngredientNameToId.set(ingredient.name, ingredient.id);
		});
	}

	return createdIngredientNameToId;
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
	ingredientNameToIdMap: IngredientNameToIdMap,
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
			ingredientNameToIdMap.get(spec.ingredient?.name ?? "");

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

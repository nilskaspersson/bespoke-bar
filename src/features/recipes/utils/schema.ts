import type { RecipeFormData } from "@/db/schema/composite";
import {
	type Ingredient,
	type InsertIngredient,
	insertIngredientSchema,
} from "@/db/schema/ingredients";
import { type BaseRecipe, insertRecipeSchema } from "@/db/schema/recipes";
import {
	type DraftSpecWithDraftIngredient,
	type InsertSpec,
	insertSpecsSchema,
} from "@/db/schema/specs";

/**
 * Prepares spec data for insertion by mapping ingredient IDs and recipe ID.
 */
export function prepareSpecsForInsertion(
	userInputRecipe: BaseRecipe,
	recipeId: string,
	getIngredientId: (
		spec: DraftSpecWithDraftIngredient,
	) => Ingredient["id"] | undefined,
): InsertSpec[] {
	if (!userInputRecipe.specs) {
		throw new Error(`No specs found for recipe ${userInputRecipe.name}`);
	}

	return userInputRecipe.specs.map((spec) => {
		const ingredientId = getIngredientId(spec);

		if (!ingredientId) {
			throw new Error(
				`No ingredientId found for spec ${spec.ingredient.name} in recipe ${userInputRecipe.name}`,
			);
		}

		return insertSpecsSchema.parse({
			quantity: spec.quantity,
			unit: spec.unit,
			ingredientId,
			recipeId,
		});
	});
}

/**
 * Validates recipe data and prepares it for insertion.
 */
export function validateRecipes(
	userInputRecipes: BaseRecipe[],
	userId: string,
	orgId: string,
): ReturnType<typeof insertRecipeSchema.parse>[] {
	userInputRecipes.forEach((recipe, index) => {
		if (!recipe.specs || recipe.specs.length === 0) {
			throw new Error(`No specs provided for recipe at index ${index}`);
		}
	});

	return userInputRecipes.map((recipe) =>
		insertRecipeSchema.parse({
			name: recipe.name ?? null,
			description: recipe.description ?? null,
			createdBy: userId,
			orgId,
		}),
	);
}

/**
 * Extracts new ingredients from user input
 */
export function extractIngredientsToCreate(
	userInputRecipes: RecipeFormData[],
	userId: string,
	orgId: string,
): Map<Ingredient["name"], InsertIngredient> {
	const uniqueIngredientsToCreate = new Map<
		Ingredient["name"],
		InsertIngredient
	>();

	userInputRecipes.forEach((recipe) => {
		recipe.specs?.forEach((spec) => {
			/**
			 * No spec ingredientId but a defined ingredient object + name = new ingredient
			 */
			if (!spec.ingredientId && spec.ingredient?.name) {
				if (uniqueIngredientsToCreate.has(spec.ingredient.name)) {
					return;
				}

				const validatedIngredient = insertIngredientSchema.parse({
					...spec.ingredient,
					createdBy: userId,
					orgId,
				});

				uniqueIngredientsToCreate.set(
					spec.ingredient.name,
					validatedIngredient,
				);
			}
		});
	});

	return uniqueIngredientsToCreate;
}

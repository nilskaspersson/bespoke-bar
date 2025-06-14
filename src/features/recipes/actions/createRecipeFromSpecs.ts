"use server";

import { db } from "@/db";
import {
	IngredientsTable,
	type InsertIngredient,
	insertIngredientSchema,
} from "@/db/schema/ingredients";
import {
	type DraftRecipe,
	insertRecipeSchema,
	RecipesTable,
	type RecipeWithSpecs,
} from "@/db/schema/recipes";
import {
	type InsertSpec,
	insertSpecsSchema,
	SpecsTable,
} from "@/db/schema/specs";
import { authOrForbidden } from "@/utils/auth";

/**
 * Given user input specs with ingredient data, create ingredients, recipes, and
 * specs in the database for multiple recipes in a single transaction.
 * @returns Array of newly created Recipes with Specs.
 */
export async function createRecipesFromSpecs(
	userInputRecipes: DraftRecipe[],
): Promise<RecipeWithSpecs[]> {
	const { userId, orgId } = await authOrForbidden();

	if (!userInputRecipes || userInputRecipes.length === 0) {
		throw new Error("No recipes provided");
	}

	// Validate all recipes have specs
	userInputRecipes.forEach((recipe, index) => {
		if (!recipe.specs || recipe.specs.length === 0) {
			throw new Error(`No specs provided for recipe at index ${index}`);
		}
	});

	/**
	 * Validate all recipe data upfront
	 */
	const validatedUserInputRecipes = userInputRecipes.map((recipe) =>
		insertRecipeSchema.parse({
			name: recipe.name ?? null,
			description: recipe.description ?? null,
			createdBy: userId,
			orgId,
		}),
	);

	/**
	 * Collect all unique ingredients that need to be created across ALL recipes
	 */
	const uniqueIngredientsToCreate = new Map<string, InsertIngredient>();

	userInputRecipes.forEach((recipe) => {
		recipe.specs?.forEach((spec) => {
			if (!spec.ingredient?.id && spec.ingredient?.name) {
				const ingredientName = spec.ingredient.name;
				if (!uniqueIngredientsToCreate.has(ingredientName)) {
					const validatedIngredient = insertIngredientSchema.parse({
						...spec.ingredient,
						createdBy: userId,
						orgId,
					});
					uniqueIngredientsToCreate.set(ingredientName, validatedIngredient);
				}
			}
		});
	});

	/**
	 * Parse all specs eagerly to avoid starting the tx in case of invalid data
	 */
	const specValidationSchema = insertSpecsSchema.omit({
		ingredientId: true,
		recipeId: true,
	});

	userInputRecipes.forEach((recipe) => {
		if (recipe.specs) {
			specValidationSchema.array().parse(recipe.specs);
		}
	});

	/**
	 * Start the db transaction
	 */
	const result = await db.transaction(async (tx) => {
		/**
		 * Insert all new ingredients once and create name-to-id mapping
		 */
		const createdIngredientNameToId = new Map<string, string>();

		if (uniqueIngredientsToCreate.size > 0) {
			const ingredientsToInsert = Array.from(
				uniqueIngredientsToCreate.values(),
			);
			const createdIngredients = await tx
				.insert(IngredientsTable)
				.values(ingredientsToInsert)
				.returning();

			createdIngredients.forEach((ingredient) => {
				createdIngredientNameToId.set(ingredient.name, ingredient.id);
			});
		}

		/**
		 * Process each recipe: insert recipe, then its specs
		 */
		const createdRecipesWithSpecs: RecipeWithSpecs[] = [];

		for (let i = 0; i < userInputRecipes.length; i++) {
			const userInputRecipe = userInputRecipes[i];
			const validatedRecipe = validatedUserInputRecipes[i];

			/**
			 * Insert the Recipe
			 */
			const [recipe] = await tx
				.insert(RecipesTable)
				.values(validatedRecipe)
				.returning();

			if (!recipe) {
				throw new Error(`Failed to create recipe at index ${i}`);
			}

			/**
			 * Prepare specs with recipeId and ingredientIds, then insert them
			 */
			if (!userInputRecipe.specs) {
				throw new Error(`No specs found for recipe at index ${i}`);
			}

			const specsToInsert: InsertSpec[] = userInputRecipe.specs.map(
				(spec, specIndex) => {
					const ingredientId =
						spec.ingredientId ||
						(spec.ingredient?.name
							? createdIngredientNameToId.get(spec.ingredient.name)
							: undefined);

					if (!ingredientId) {
						throw new Error(
							`No ingredientId found for spec at index ${specIndex} in recipe at index ${i}`,
						);
					}

					return insertSpecsSchema.parse({
						quantity: spec.quantity,
						unit: spec.unit,
						ingredientId,
						recipeId: recipe.id,
					});
				},
			);

			const specs = await tx
				.insert(SpecsTable)
				.values(specsToInsert)
				.returning();

			createdRecipesWithSpecs.push({
				...recipe,
				specs,
			});
		}

		return createdRecipesWithSpecs;
	});

	return result;
}

"use server";

import { db } from "@/db";
import { type Ingredient, IngredientsTable } from "@/db/schema/ingredients";
import {
	type BaseRecipe,
	type Recipe,
	RecipesTable,
} from "@/db/schema/recipes";
import { insertSpecsSchema, SpecsTable } from "@/db/schema/specs";
import {
	extractIngredientsToCreate,
	prepareSpecsForInsertion,
	validateRecipes,
} from "@/features/recipes/utils/schema";
import { authOrForbidden } from "@/utils/auth";

/**
 * Given user input specs with ingredient data, create ingredients, recipes, and
 * specs in the database for multiple recipes in a single transaction.
 * @returns Array of newly created Recipes with Specs.
 */
export async function createRecipesFromSpecs(
	userInputRecipes: BaseRecipe[],
): Promise<Recipe[]> {
	const { userId, orgId } = await authOrForbidden();

	if (!userInputRecipes || userInputRecipes.length === 0) {
		throw new Error("No recipes provided");
	}

	/**
	 * 1. Validate all recipes
	 */
	const validatedRecipes = validateRecipes(userInputRecipes, userId, orgId);

	/**
	 * 2. Then all specs, only to throw for invalid structures
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
	 * 3. Finally extract ingredients to create and validate them
	 */
	const ingredientsToCreate = extractIngredientsToCreate(
		userInputRecipes,
		userId,
		orgId,
	);

	/**
	 * Start the db transaction
	 */
	const result = await db.transaction(async (tx) => {
		/**
		 * Insert all new ingredients once and create name-to-id mapping
		 */
		const createdIngredientNameToId = new Map<
			Ingredient["name"],
			Ingredient["id"]
		>();

		if (ingredientsToCreate.size > 0) {
			const ingredientsToInsert = Array.from(ingredientsToCreate.values());

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
		const createdRecipesWithSpecs: Recipe[] = [];

		for (let i = 0; i < userInputRecipes.length; i++) {
			const userInputRecipe = userInputRecipes[i];
			const validatedRecipe = validatedRecipes[i];

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
			 * Prepare and insert Specs
			 */
			const specsToInsert = prepareSpecsForInsertion(
				userInputRecipe,
				recipe.id,
				(spec) =>
					spec.ingredientId ||
					createdIngredientNameToId.get(spec.ingredient?.name ?? ""),
			);

			await tx.insert(SpecsTable).values(specsToInsert);

			createdRecipesWithSpecs.push(recipe);
		}

		return createdRecipesWithSpecs;
	});

	return result;
}

import { after } from "next/server";
import { db } from "@/db";
import type { RecipeFormData } from "@/db/schema/composite";
import type { Recipe } from "@/db/schema/recipes";
import { enrichIngredients } from "@/features/ingredients/api/enrichIngredients";
import {
	insertIngredientsInTransaction,
	replaceSpecsInTransaction,
	upsertRecipeInTransaction,
} from "@/features/recipes/api/utils/transactionHelpers";
import { extractIngredientsToCreate } from "@/features/recipes/utils/schema";
import type { Auth } from "@/utils/auth";
import { cacheEvents } from "@/utils/cache";

export async function upsertRecipesWithSpecs(
	auth: Auth,
	userInputRecipes: RecipeFormData[],
): Promise<Recipe[]> {
	const { userId, orgId } = auth;

	const ingredientsToCreate = extractIngredientsToCreate(
		userInputRecipes,
		userId,
		orgId,
	);

	const [recipes, createdIngredients] = await db.transaction(async (tx) => {
		/**
		 * Step 1: Insert all new ingredients once and create a name-to-id mapping
		 */
		const [ingredientIdsByName, createdIngredients] =
			await insertIngredientsInTransaction(
				tx,
				Array.from(ingredientsToCreate.values()),
			);

		/**
		 * Step 2: Create or update each recipe
		 */
		const processedRecipes: [Recipe, boolean][] = [];

		for (const o of userInputRecipes) {
			/**
			 * Step 3: Upsert the recipe
			 */
			const [processedRecipe, isNew] = await upsertRecipeInTransaction(
				tx,
				o.recipe,
				userId,
				orgId,
			);

			/**
			 * Step 4: Replace all specs for the recipe with provided specs
			 * TODO: Merge with `processedRecipe` for a more complete return value?
			 */
			await replaceSpecsInTransaction(
				tx,
				processedRecipe.id,
				o.specs,
				ingredientIdsByName,
			);

			processedRecipes.push([processedRecipe, isNew]);
		}

		return [processedRecipes, createdIngredients] as const;
	});

	recipes.forEach(([recipe, isNew]) => {
		if (isNew) {
			cacheEvents.recipe.create.emit(orgId);
		} else {
			cacheEvents.recipe.update.emit(orgId, recipe.id);
		}
	});

	if (createdIngredients.length > 0) {
		cacheEvents.ingredient.create.emit(orgId);

		/**
		 * Step 5: Lazily enrich newly created ingredients with LLM-generated metadata
		 */
		after(async () => {
			try {
				await enrichIngredients(orgId, createdIngredients);
			} catch (error) {
				console.error("Ingredient enrichment failed:", error);
			}
		});
	}

	return recipes.map(([recipe]) => recipe);
}

import { after } from "next/server";
import { db } from "@/db";
import type { RecipeFormData } from "@/db/schema/composite";
import type { Recipe } from "@/db/schema/recipes";
import { getRecipeSlotUsage } from "@/features/billing/api/getRecipeSlotUsage";
import { enrichIngredients } from "@/features/ingredients/api/enrichIngredients";
import { enrichRecipes } from "@/features/recipes/api/enrichRecipes";
import {
	insertIngredientsInTransaction,
	replaceSpecsInTransaction,
	upsertRecipeInTransaction,
} from "@/features/recipes/api/utils/transactionHelpers";
import { extractIngredientsToCreate } from "@/features/recipes/utils/schema";
import { rateLimit } from "@/rateLimit";
import { AppError } from "@/utils/appError";
import type { Auth } from "@/utils/auth";
import { cacheEvents } from "@/utils/cache";

export async function upsertRecipesWithSpecs(
	auth: Auth,
	userInputRecipes: RecipeFormData[],
): Promise<Recipe[]> {
	const { userId, orgId } = auth;

	if (userInputRecipes.length === 0) {
		throw new AppError({ code: "NO_RECIPES_PROVIDED" });
	}

	await rateLimit(userId);

	const newCount = userInputRecipes.filter(
		(o) => o.recipe?.id === undefined,
	).length;

	if (newCount > 0) {
		const { used, limit } = await getRecipeSlotUsage(orgId);

		if (used + newCount > limit) {
			throw new AppError({
				code: "RECIPE_SLOT_LIMIT_REACHED",
				used,
				limit,
				requested: newCount,
			});
		}
	}

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

	const newRecipeIds = recipes
		.filter(([, isNew]) => isNew)
		.map(([recipe]) => recipe.id);

	if (newRecipeIds.length > 0) {
		/**
		 * Lazily enrich newly created recipes (style + derived glassware/prep).
		 */
		after(async () => {
			try {
				await enrichRecipes(orgId, newRecipeIds);
			} catch (error) {
				console.error("Recipe enrichment failed:", error);
			}
		});
	}

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

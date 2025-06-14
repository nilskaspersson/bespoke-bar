"use server";

import { db } from "@/db";
import {
	IngredientsTable,
	insertIngredientSchema,
} from "@/db/schema/ingredients";
import {
	type DraftRecipe,
	insertRecipeSchema,
	RecipesTable,
	type RecipeWithSpecs,
} from "@/db/schema/recipes";
import {
	type DraftSpecWithDraftIngredient,
	type InsertSpec,
	insertSpecsSchema,
	SpecsTable,
} from "@/db/schema/specs";
import { authOrForbidden } from "@/utils/auth";

/**
 * Given user input specs with ingredient data, create ingredients, recipe, and
 * specs in the database.
 * @returns Newly created Recipe with Specs.
 */
export async function createRecipeFromSpecs(
	userInputSpecs: DraftSpecWithDraftIngredient[],
	userInputRecipe?: DraftRecipe,
): Promise<RecipeWithSpecs> {
	const { userId, orgId } = await authOrForbidden();

	const validatedUserInputRecipe = insertRecipeSchema.parse({
		name: userInputRecipe?.name ?? null,
		description: userInputRecipe?.description ?? null,
		createdBy: userId,
		orgId,
	});

	/**
	 * Find all ingredients that need to be created from among the specs.
	 */
	const validatedNewIngredients = userInputSpecs
		.filter((spec) => !spec.ingredient?.id && spec.ingredient?.name)
		.map(({ ingredient }) =>
			insertIngredientSchema.parse({
				...ingredient,
				createdBy: userId,
				orgId,
			}),
		);

	/**
	 * Parse specs eagerly to avoid starting the tx in case of invalid data.
	 */
	insertSpecsSchema
		.omit({ ingredientId: true, recipeId: true })
		.array()
		.parse(userInputSpecs);

	/**
	 * Start the db transaction
	 */
	const result = await db.transaction(async (tx) => {
		/**
		 * Insert the new ingredients and map the name to the id. This map is used to populate the Specs with the correct ingredientId.
		 */
		const createdIngredientNameToId = new Map<string, string>();

		if (validatedNewIngredients.length > 0) {
			const createdIngredients = await tx
				.insert(IngredientsTable)
				.values(validatedNewIngredients)
				.returning();

			createdIngredients.forEach((ingredient) => {
				createdIngredientNameToId.set(ingredient.name, ingredient.id);
			});
		}

		/**
		 * Insert the Recipe
		 */
		const [recipe] = await tx
			.insert(RecipesTable)
			.values(validatedUserInputRecipe)
			.returning();

		/**
		 * Prepare specs with recipeId and ingredientIds, then insert them.
		 */
		const specsToInsert: InsertSpec[] = userInputSpecs.map((spec, index) => {
			const ingredientId =
				spec.ingredientId ||
				createdIngredientNameToId.get(spec.ingredient?.name ?? "");

			if (!ingredientId) {
				throw new Error(`No ingredientId found for spec at index ${index}`);
			}

			return insertSpecsSchema.parse({
				quantity: spec.quantity,
				unit: spec.unit,
				ingredientId,
				recipeId: recipe.id,
			});
		});

		const specs = await tx.insert(SpecsTable).values(specsToInsert).returning();

		return {
			...recipe,
			specs,
		};
	});

	return result;
}

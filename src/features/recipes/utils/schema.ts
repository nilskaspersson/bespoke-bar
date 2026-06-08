import type { RecipeFormData } from "@/db/schema/composite";
import {
	type Ingredient,
	type InsertIngredient,
	insertIngredientSchema,
} from "@/db/schema/ingredients";

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
				/**
				 * Avoid creating the same ingredient twice, if used multiple times in the tx
				 */
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

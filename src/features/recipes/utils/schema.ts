import type { RecipeFormData } from "@/db/schema/composite";
import {
	type Ingredient,
	type InsertIngredient,
	insertIngredientSchema,
} from "@/db/schema/ingredients";
import { normalizeIngredientName } from "@/utils/normalizeIngredientName";

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
				const key = normalizeIngredientName(spec.ingredient.name);

				if (uniqueIngredientsToCreate.has(key)) {
					return;
				}

				const validatedIngredient = insertIngredientSchema.parse({
					...spec.ingredient,
					createdBy: userId,
					orgId,
				});

				uniqueIngredientsToCreate.set(key, validatedIngredient);
			}
		});
	});

	return uniqueIngredientsToCreate;
}

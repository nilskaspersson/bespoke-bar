"use server";

import type { RecipeFormData } from "@/db/schema/composite";
import type { Recipe } from "@/db/schema/recipes";
import { getCachedRecipe } from "@/features/recipes/api/readRecipe";
import { upsertRecipesWithSpecs } from "@/features/recipes/api/upsertRecipesWithSpecs";
import { pick } from "@/utils";
import { authOrForbidden } from "@/utils/auth";

export async function duplicateRecipeAction(recipeId: string): Promise<Recipe> {
	const { orgId } = await authOrForbidden();

	const recipe = await getCachedRecipe(orgId, recipeId);

	if (!recipe) {
		throw new Error("Recipe not found");
	}

	const duplicateData: RecipeFormData = {
		recipe: {
			name: `${recipe.name} (Copy)`,
			...pick(
				recipe,
				"description",
				"instructions",
				"preparationMethod",
				"dilutionTarget",
				"glassware",
				"garnish",
				"style",
			),
		},
		specs: recipe.specs.map((spec) =>
			pick(spec, "quantity", "unit", "ingredientId", "optional"),
		),
	};

	const [newRecipe] = await upsertRecipesWithSpecs([duplicateData]);

	return newRecipe;
}

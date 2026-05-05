import type { RecipeFormData } from "@/db/schema/composite";
import type { Recipe } from "@/db/schema/recipes";
import { getCachedRecipe } from "@/features/recipes/api/readRecipe";
import { upsertRecipesWithSpecs } from "@/features/recipes/api/upsertRecipesWithSpecs.service";
import { rateLimit } from "@/rateLimit";
import { pick } from "@/utils";
import type { Auth } from "@/utils/auth";

export async function duplicateRecipe(
	auth: Auth,
	recipeId: string,
): Promise<Recipe> {
	const { userId, orgId } = auth;

	await rateLimit(userId);

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

	const [newRecipe] = await upsertRecipesWithSpecs(auth, [duplicateData]);

	return newRecipe;
}

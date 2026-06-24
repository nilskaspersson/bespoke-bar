import { pick } from "@bespoke/domain/utils/collection";
import type { RecipeFormData } from "@bespoke/schema/schema/composite";
import type { Recipe } from "@bespoke/schema/schema/recipes";
import type { Auth } from "../auth";
import { rateLimit } from "../rateLimit";
import { getCachedRecipe } from "./readRecipe";
import { upsertRecipesWithLines } from "./upsertRecipesWithLines.service";

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
		lines: recipe.lines.map((line) =>
			pick(line, "quantity", "unit", "ingredientId", "optional"),
		),
	};

	const [newRecipe] = await upsertRecipesWithLines(auth, [duplicateData]);

	return newRecipe;
}

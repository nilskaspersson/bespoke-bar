import { db } from "@/db";
import { type Ingredient, IngredientsTable } from "@/db/schema/ingredients";
import {
	type DraftRecipe,
	RecipesTable,
	type RecipeWithSpecs,
} from "@/db/schema/recipes";
import { SpecsTable } from "@/db/schema/specs";
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
	userInputRecipes: DraftRecipe[],
): Promise<RecipeWithSpecs[]> {
	"use server";

	const { userId, orgId } = await authOrForbidden();

	if (!userInputRecipes || userInputRecipes.length === 0) {
		throw new Error("No recipes provided");
	}

	const validatedRecipes = validateRecipes(userInputRecipes, userId, orgId);

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
		const createdRecipesWithSpecs: RecipeWithSpecs[] = [];

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

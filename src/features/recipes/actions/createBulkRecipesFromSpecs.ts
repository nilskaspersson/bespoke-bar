import { db } from "@/db";
import {
	type DraftRecipe,
	insertRecipeSchema,
	type Recipe,
	RecipesTable,
} from "@/db/schema/recipes";
import {
	type InsertSpec,
	insertSpecsSchema,
	SpecsTable,
} from "@/db/schema/specs";
import { authOrForbidden } from "@/utils/auth";

/**
 * Given a draft recipe, create a series of recipes and specs in the database.
 * @returns Newly created Recipes with Specs.
 */
export async function createBulkRecipesFromSpecs(
	userInputDraftRecipes: DraftRecipe[],
): Promise<Recipe["id"][]> {
	"use server";

	const { userId, orgId } = await authOrForbidden();

	const validatedUserInputRecipes = insertRecipeSchema.array().parse(
		userInputDraftRecipes.map((draftRecipe) => ({
			name: draftRecipe.name,
			description: draftRecipe.description,
			createdBy: userId,
			orgId,
		})),
	);

	const validatedUserInputSpecsGroups: Omit<InsertSpec, "recipeId">[][] =
		userInputDraftRecipes.map((draftRecipe) =>
			insertSpecsSchema
				.omit({ recipeId: true })
				.array()
				.parse(
					draftRecipe.specs?.map((spec) => ({
						quantity: spec.quantity,
						unit: spec.unit,
						ingredientId: spec.ingredientId,
					})),
				),
		);

	const result = await db.transaction(async (tx) => {
		const recipes = await tx
			.insert(RecipesTable)
			.values(validatedUserInputRecipes)
			.returning();

		const specSetsToInsert: InsertSpec[] = [];

		recipes.forEach((recipe, index) => {
			const specs = validatedUserInputSpecsGroups[index].map((spec) => ({
				...spec,
				recipeId: recipe.id,
			}));

			/**
			 * Run schema once again, without omits
			 */
			const validatedSpecsForThisRecipe = insertSpecsSchema
				.array()
				.parse(specs);

			specSetsToInsert.push(...validatedSpecsForThisRecipe);
		});

		await tx.insert(SpecsTable).values(specSetsToInsert);

		return recipes.map((recipe) => recipe.id);
	});

	return result;
}

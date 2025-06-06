import { auth } from "@clerk/nextjs/server";
import { forbidden } from "next/navigation";
import { db } from "@/db";
import {
	type DraftRecipe,
	insertRecipeSchema,
	type Recipe,
	RecipesTable,
} from "@/db/schema/recipes";
import {
	type InsertSpec,
	SpecsTable,
	specsInsertSchema,
} from "@/db/schema/specs";

/**
 * Given a draft recipe, create a series of recipes and specs in the database.
 * @returns Newly created Recipes with Specs.
 */
export async function createBulkRecipesFromSpecs(
	userInputDraftRecipes: DraftRecipe[],
): Promise<Recipe["id"][]> {
	"use server";

	const { userId, orgId } = await auth();

	if (!userId) {
		forbidden();
	}

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
			specsInsertSchema
				.omit({ recipeId: true })
				.array()
				.parse(
					draftRecipe.specs?.map((spec) => ({
						quantity: spec.quantity,
						unit: spec.unit,
						ingredient: spec.ingredient,
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
			const validatedSpecsForThisRecipe = specsInsertSchema
				.array()
				.parse(specs);

			specSetsToInsert.push(...validatedSpecsForThisRecipe);
		});

		await tx.insert(SpecsTable).values(specSetsToInsert);

		return recipes.map((recipe) => recipe.id);
	});

	return result;
}

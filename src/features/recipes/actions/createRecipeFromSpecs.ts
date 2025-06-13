import { db } from "@/db";
import {
	type DraftRecipe,
	insertRecipeSchema,
	RecipesTable,
	type RecipeWithSpecs,
} from "@/db/schema/recipes";
import {
	type DraftSpec,
	type InsertSpec,
	insertSpecsSchema,
	SpecsTable,
} from "@/db/schema/specs";
import { authOrForbidden } from "@/utils/auth";

/**
 * Given user input specs, create a recipe and specs in the database. Optionally
 * provide a partial Recipe to initialise the object.
 * @returns Newly created Recipe with Specs.
 */
export async function createRecipeFromSpecs(
	userInputSpecs: DraftSpec[],
	userInputRecipe?: DraftRecipe,
): Promise<RecipeWithSpecs> {
	"use server";

	const { userId, orgId } = await authOrForbidden();

	const validatedUserInputRecipe = insertRecipeSchema.parse({
		name: userInputRecipe?.name ?? null,
		description: userInputRecipe?.description ?? null,
		createdBy: userId,
		orgId: orgId,
	});

	const validatedUserInputSpecs: Omit<InsertSpec, "recipeId">[] =
		insertSpecsSchema
			.omit({ recipeId: true })
			.array()
			.parse(
				userInputSpecs.map((spec) => ({
					quantity: spec.quantity,
					unit: spec.unit,
					ingredientId: spec.ingredientId,
				})),
			);

	const result = await db.transaction(async (tx) => {
		const [recipe] = await tx
			.insert(RecipesTable)
			.values(validatedUserInputRecipe)
			.returning();

		/**
		 * Run schema once again, without omits
		 */
		const specsToInsert = insertSpecsSchema
			.array()
			.parse(validatedUserInputSpecs);

		const specs = await tx.insert(SpecsTable).values(specsToInsert).returning();

		return {
			...recipe,
			specs,
		};
	});

	return result;
}

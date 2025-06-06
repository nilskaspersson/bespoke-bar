import { auth } from "@clerk/nextjs/server";
import { forbidden } from "next/navigation";
import { db } from "@/db";
import {
	insertRecipeSchema,
	RecipesTable,
	type RecipeWithSpecs,
	type UserInputRecipe,
} from "@/db/schema/recipes";
import {
	type InsertSpec,
	SpecsTable,
	specsInsertSchema,
	type UserInputSpec,
} from "@/db/schema/specs";

/**
 * Given user input specs, create a recipe and specs in the database. Optionally
 * provide a partial Recipe to initialise the object.
 * @returns Newly created Recipe with Specs.
 */
export async function createRecipeFromSpecs(
	userInputSpecs: UserInputSpec[],
	userInputRecipe?: Partial<UserInputRecipe>,
): Promise<RecipeWithSpecs> {
	"use server";

	const { userId, orgId } = await auth();

	if (!userId) {
		forbidden();
	}

	const validatedUserInputRecipe = insertRecipeSchema.parse({
		name: userInputRecipe?.name ?? null,
		description: userInputRecipe?.description ?? null,
		createdBy: userId,
		orgId: orgId,
	});

	const validatedUserInputSpecs: Omit<InsertSpec, "recipeId">[] =
		specsInsertSchema
			.omit({ recipeId: true })
			.array()
			.parse(
				userInputSpecs.map((spec) => ({
					quantity: spec.quantity,
					unit: spec.unit,
					ingredient: spec.ingredient ?? "",
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
		const specsToInsert = specsInsertSchema
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

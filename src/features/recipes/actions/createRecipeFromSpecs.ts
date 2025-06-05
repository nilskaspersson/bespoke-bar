import { auth } from "@clerk/nextjs/server";
import { forbidden } from "next/navigation";
import { db } from "@/db";
import {
	type InsertRecipe,
	RecipesTable,
	type RecipeWithSpecs,
	type UserInputRecipe,
} from "@/db/schema/recipes";
import {
	type InsertSpec,
	SpecsTable,
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

	const result = await db.transaction(async (tx) => {
		const [recipe] = await tx
			.insert(RecipesTable)
			.values({
				name: userInputRecipe?.name ?? null,
				description: userInputRecipe?.description ?? null,
				createdBy: userId,
				orgId: orgId,
			} satisfies InsertRecipe)
			.returning();

		const specsToInsert: InsertSpec[] = userInputSpecs.map((spec) => ({
			recipeId: recipe.id,
			quantity: spec.quantity,
			unit: spec.unit,
			ingredient: spec.ingredient ?? "",
		}));

		const specs = await tx.insert(SpecsTable).values(specsToInsert).returning();

		return {
			...recipe,
			specs,
		};
	});

	return result;
}

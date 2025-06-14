import { db } from "@/db";
import {
	type Ingredient,
	IngredientsTable,
	type InsertIngredient,
	insertIngredientSchema,
} from "@/db/schema/ingredients";
import {
	type DraftRecipe,
	insertRecipeSchema,
	RecipesTable,
	type RecipeWithSpecs,
} from "@/db/schema/recipes";
import {
	type InsertSpec,
	insertSpecsSchema,
	SpecsTable,
} from "@/db/schema/specs";
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

	const { validatedRecipes, uniqueIngredientsToCreate } =
		validateAndExtractIngredients(userInputRecipes, userId, orgId);

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

		if (uniqueIngredientsToCreate.size > 0) {
			const ingredientsToInsert = Array.from(
				uniqueIngredientsToCreate.values(),
			);

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
				createdIngredientNameToId,
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

/**
 * Validates ingredients and extracts ingredients to be created.
 */
function validateAndExtractIngredients(
	userInputRecipes: DraftRecipe[],
	userId: string,
	orgId: string,
): {
	validatedRecipes: ReturnType<typeof insertRecipeSchema.parse>[];
	uniqueIngredientsToCreate: Map<Ingredient["name"], InsertIngredient>;
} {
	// Validate all recipes have specs
	userInputRecipes.forEach((recipe, index) => {
		if (!recipe.specs || recipe.specs.length === 0) {
			throw new Error(`No specs provided for recipe at index ${index}`);
		}
	});

	/**
	 * Validate all recipe data upfront
	 */
	const validatedRecipes = userInputRecipes.map((recipe) =>
		insertRecipeSchema.parse({
			name: recipe.name ?? null,
			description: recipe.description ?? null,
			createdBy: userId,
			orgId,
		}),
	);

	/**
	 * Collect unique ingredients by name (first occurrence wins).
	 */
	const uniqueIngredientsToCreate = new Map<
		Ingredient["name"],
		InsertIngredient
	>();

	userInputRecipes.forEach((recipe) => {
		recipe.specs?.forEach((spec) => {
			if (!spec.ingredient?.id && spec.ingredient?.name) {
				const ingredientName = spec.ingredient.name;
				/**
				 * Only add if we haven't seen this name before. This way, a set of Recipes can all
				 * contain the same new ingredient.
				 */
				if (!uniqueIngredientsToCreate.has(ingredientName)) {
					const validatedIngredient = insertIngredientSchema.parse({
						...spec.ingredient,
						createdBy: userId,
						orgId,
					});

					uniqueIngredientsToCreate.set(ingredientName, validatedIngredient);
				}
			}
		});
	});

	/**
	 * Parse all specs eagerly to avoid starting the tx in case of invalid data
	 */
	const specValidationSchema = insertSpecsSchema.omit({
		ingredientId: true,
		recipeId: true,
	});

	userInputRecipes.forEach((recipe) => {
		if (recipe.specs) {
			specValidationSchema.array().parse(recipe.specs);
		}
	});

	return {
		validatedRecipes,
		uniqueIngredientsToCreate,
	};
}

/**
 * Prepares spec data for insertion by mapping ingredient IDs and recipe ID.
 */
export function prepareSpecsForInsertion(
	userInputRecipe: DraftRecipe,
	recipeId: string,
	ingredientNameToId: Map<string, string>,
): InsertSpec[] {
	if (!userInputRecipe.specs) {
		throw new Error(`No specs found for recipe ${userInputRecipe.name}`);
	}

	return userInputRecipe.specs.map((spec) => {
		const ingredientId =
			spec.ingredientId ||
			(spec.ingredient?.name
				? ingredientNameToId.get(spec.ingredient.name)
				: undefined);

		if (!ingredientId) {
			throw new Error(
				`No ingredientId found for spec ${spec.ingredient.name} in recipe ${userInputRecipe.name}`,
			);
		}

		return insertSpecsSchema.parse({
			quantity: spec.quantity,
			unit: spec.unit,
			ingredientId,
			recipeId,
		});
	});
}

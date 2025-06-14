import {
	type Ingredient,
	type InsertIngredient,
	insertIngredientSchema,
} from "@/db/schema/ingredients";
import { type DraftRecipe, insertRecipeSchema } from "@/db/schema/recipes";
import {
	type DraftSpecWithDraftIngredient,
	type InsertSpec,
	insertSpecsSchema,
} from "@/db/schema/specs";

/**
 * Prepares spec data for insertion by mapping ingredient IDs and recipe ID.
 */
export function prepareSpecsForInsertion(
	userInputRecipe: DraftRecipe,
	recipeId: string,
	getIngredientId: (
		spec: DraftSpecWithDraftIngredient,
	) => Ingredient["id"] | undefined,
): InsertSpec[] {
	if (!userInputRecipe.specs) {
		throw new Error(`No specs found for recipe ${userInputRecipe.name}`);
	}

	return userInputRecipe.specs.map((spec) => {
		const ingredientId = getIngredientId(spec);

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

/**
 * Validates ingredients and extracts ingredients to be created.
 */
export function validateAndExtractIngredients(
	userInputRecipes: DraftRecipe[],
	userId: string,
	orgId: string,
): {
	validatedRecipes: ReturnType<typeof insertRecipeSchema.parse>[];
	uniqueIngredientsToCreate: Map<Ingredient["name"], InsertIngredient>;
} {
	/**
	 * All recipes have specs
	 */
	userInputRecipes.forEach((recipe, index) => {
		if (!recipe.specs || recipe.specs.length === 0) {
			throw new Error(`No specs provided for recipe at index ${index}`);
		}
	});

	/**
	 * Validate recipes, prepare with creator data
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
	 * Collect unique ingredients by name (first occurrence's config wins).
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

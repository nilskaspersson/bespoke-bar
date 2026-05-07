import type { RecipeListWithRecipes } from "@/db/schema/composite";
import type { Ingredient } from "@/db/schema/ingredients";
import type { RecipeListEntryWithRecipe } from "@/db/schema/recipeListEntries";
import type { Spec, SpecWithIngredient } from "@/db/schema/specs";

export type IngredientMap = Map<Ingredient["id"], Ingredient>;

export function buildIngredientMap(ingredients: Ingredient[]): IngredientMap {
	return new Map(ingredients.map((ingredient) => [ingredient.id, ingredient]));
}

function makeFallbackIngredient(spec: Spec): Ingredient {
	return {
		id: spec.ingredientId,
		name: "Unknown ingredient",
		description: null,
		category: null,
		abv: null,
		brand: null,
		unitCost: null,
		measurementType: null,
		orgId: "",
		createdAt: "",
		createdBy: "",
		updatedAt: null,
		updatedBy: null,
		aiEnrichedFields: null,
	};
}

export function stitchSpecs(
	specs: Spec[],
	ingredients: IngredientMap,
): SpecWithIngredient[] {
	return specs.map((spec) => {
		const ingredient =
			ingredients.get(spec.ingredientId) ?? makeFallbackIngredient(spec);
		return { ...spec, ingredient };
	});
}

export function stitchRecipeListEntries(
	list: RecipeListWithRecipes<Spec>,
	ingredients: IngredientMap,
): RecipeListWithRecipes {
	return {
		...list,
		entries: list.entries.map(
			(entry): RecipeListEntryWithRecipe => ({
				...entry,
				recipe: {
					...entry.recipe,
					specs: stitchSpecs(entry.recipe.specs, ingredients),
				},
			}),
		),
	};
}

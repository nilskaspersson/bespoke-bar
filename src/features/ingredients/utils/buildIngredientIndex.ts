import type { Ingredient } from "@/db/schema/ingredients";
import { indexBy } from "@/utils";

export type IngredientIndex = Map<string, Ingredient>;

const getIngredientKey = (i: Ingredient) => i.name.toLowerCase();

export function buildIngredientIndex(
	ingredients: Ingredient[],
): IngredientIndex {
	return indexBy(ingredients, getIngredientKey);
}

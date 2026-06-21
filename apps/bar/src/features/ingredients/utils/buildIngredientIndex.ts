import type { Ingredient } from "@bespoke/schema/schema/ingredients";
import { indexBy, normalizeInput } from "@/utils";

export type IngredientIndex = Map<string, Ingredient>;

const getIngredientKey = (i: Ingredient) => normalizeInput(i.name);

export function buildIngredientIndex(
	ingredients: Ingredient[],
): IngredientIndex {
	return indexBy(ingredients, getIngredientKey);
}

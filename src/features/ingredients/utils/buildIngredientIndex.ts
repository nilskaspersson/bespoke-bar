import type { Ingredient } from "@/db/schema/ingredients";

export type IngredientIndex = Map<string, Ingredient>;

export function buildIngredientIndex(
	ingredients: Ingredient[],
): IngredientIndex {
	const map = new Map<string, Ingredient>();
	for (const i of ingredients) {
		map.set(i.name.toLowerCase(), i);
	}
	return map;
}

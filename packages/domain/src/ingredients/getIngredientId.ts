import type { Ingredient } from "@bespoke/schema/schema/ingredients";

export const getIngredientId = (ingredient: Ingredient): string =>
	ingredient.id;

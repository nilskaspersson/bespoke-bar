import type { Ingredient } from "@bespoke/schema/schema/ingredients";
import { z } from "zod";
import { collator } from "@/utils/collator";

export const ingredientSortFieldSchema = z.enum(["created", "updated", "name"]);
export const ingredientSortDirectionSchema = z.enum(["asc", "desc"]);

export type IngredientSortField = z.infer<typeof ingredientSortFieldSchema>;
export type IngredientSortDirection = z.infer<
	typeof ingredientSortDirectionSchema
>;

export const DEFAULT_SORT_FIELD: IngredientSortField = "created";
export const DEFAULT_SORT_DIRECTION: IngredientSortDirection = "desc";

function sortTime(ingredient: Ingredient, field: IngredientSortField): number {
	const value =
		field === "updated"
			? (ingredient.updatedAt ?? ingredient.createdAt)
			: ingredient.createdAt;

	return new Date(value).getTime();
}

/** Orders by `field` in `factor` direction; equal dates always tiebreak on name ascending. */
function compareIngredients(
	a: Ingredient,
	b: Ingredient,
	field: IngredientSortField,
	factor: number,
): number {
	if (field === "name") {
		return factor * collator.compare(a.name, b.name);
	}

	const timeA = sortTime(a, field);
	const timeB = sortTime(b, field);

	return timeA !== timeB
		? factor * (timeA - timeB)
		: collator.compare(a.name, b.name);
}

export function sortIngredients(
	ingredients: Ingredient[],
	field: IngredientSortField,
	direction: IngredientSortDirection,
): Ingredient[] {
	const factor = direction === "desc" ? -1 : 1;

	return ingredients.toSorted((a, b) =>
		compareIngredients(a, b, field, factor),
	);
}

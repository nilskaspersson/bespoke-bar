import type { DraftIngredient } from "@bespoke/schema/schema/ingredients";
import type { Unit } from "@bespoke/schema/schema/units";
import { CATEGORY_DEFAULT_ABV } from "../categories/constants";
import { matchNameWithCategory } from "../categories/matchNameWithCategory";
import { getMeasurementFromUnit } from "../units/getMeasurementFromUnit";

export function getDefaultIngredientData(
	ingredientName: string,
	unit: Unit | null | undefined,
): Partial<DraftIngredient> {
	const category = matchNameWithCategory(ingredientName);

	const ingredient: DraftIngredient = {
		name: ingredientName,
		abv: category ? (CATEGORY_DEFAULT_ABV.get(category) ?? null) : null,
		brand: null,
		unitCost: null,
		category,
		measurementType: getMeasurementFromUnit(unit),
	};

	return ingredient;
}

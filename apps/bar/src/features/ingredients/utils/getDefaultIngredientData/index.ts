import type { DraftIngredient } from "@bespoke/schema/schema/ingredients";
import type { Unit } from "@bespoke/schema/schema/units";
import { CATEGORY_DEFAULT_ABV } from "@/features/categories/constants";
import { matchNameWithCategory } from "@/features/categories/utils/matchNameWithCategory";
import { getMeasurementFromUnit } from "@/features/units/utils/getMeasurementFromUnit";

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

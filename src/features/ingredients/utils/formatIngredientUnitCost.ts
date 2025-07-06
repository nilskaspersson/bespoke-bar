import type { Measurement } from "@/db/schema/units";
import { MEASUREMENT_TO_DB_INGREDIENT_UNIT } from "@/features/ingredients/constants";
import { currencyFormatter } from "@/utils/formatting";

export function formatIngredientUnitCost(
	cost: number | null,
	measurementType: Measurement | null,
): string | null {
	if (typeof cost !== "number") {
		return null;
	}

	const unit = measurementType
		? MEASUREMENT_TO_DB_INGREDIENT_UNIT.get(measurementType)
		: null;

	return currencyFormatter.format(cost) + (unit ? `/${unit}` : "");
}

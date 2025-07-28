import { useCallback } from "react";
import type { Measurement } from "@/db/schema/units";
import { MEASUREMENT_TO_DB_INGREDIENT_UNIT } from "@/features/ingredients/constants";
import { useFormatter } from "@/hooks/useFormatter";

export function useFormatIngredientUnitCost() {
	const { currencyFormatter } = useFormatter();

	return useCallback(
		(cost: number | null, measurementType: Measurement | null) => {
			if (typeof cost !== "number") {
				return null;
			}

			const unit = measurementType
				? MEASUREMENT_TO_DB_INGREDIENT_UNIT.get(measurementType)
				: null;

			return currencyFormatter.format(cost) + (unit ? `/${unit}` : "");
		},
		[currencyFormatter],
	);
}

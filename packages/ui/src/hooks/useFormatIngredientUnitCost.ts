import { MEASUREMENT_TO_DB_INGREDIENT_UNIT } from "@bespoke/domain/ingredients/constants";
import type { Measurement } from "@bespoke/schema/schema/units";
import { use, useCallback } from "react";
import { FormatterContext } from "../hooks/useFormatter";

export function useFormatIngredientUnitCost() {
	const { currencyFormatter } = use(FormatterContext);

	return useCallback(
		(cost: number | null, measurementType: Measurement | null | undefined) => {
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

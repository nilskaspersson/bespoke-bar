"use client";

import type { UnitSystems } from "@bespoke/domain/units/convert";
import { getFormattedUnit } from "@bespoke/domain/units/getFormattedUnit";
import { getUnitSystemFromUnit } from "@bespoke/domain/units/getUnitSystemFromUnit";
import { snapQuantity } from "@bespoke/domain/units/snapQuantity";
import { round } from "@bespoke/domain/utils/math";
import type { DraftIngredientLine } from "@bespoke/schema/schema/ingredientLines";
import { use, useCallback } from "react";
import { FormatterContext } from "../hooks/useFormatter";
import { useQuantityToBestUnit } from "../hooks/useQuantityToBestUnit";

/**
 * Strip IEEE-754 noise from computed quantities before they reach the display
 * (e.g. 0.75 × 10.1 = 7.574999999999999). Two decimals matches the default
 * `quantityFormatter` precision and is plenty for a pour.
 */
const DISPLAY_PRECISION = 2;

export type LineMeasure = {
	quantity: number;
	unit: string;
	formatted: string;
};

export function useFormatLineMeasure<T extends DraftIngredientLine>() {
	const { quantityFormatter } = use(FormatterContext);
	const quantityToBestUnit = useQuantityToBestUnit();

	return useCallback(
		({
			line,
			servings,
			convertUnits,
			withRounding,
			withBestUnit,
		}: {
			line: T;
			servings: number;
			convertUnits?: UnitSystems | null;
			withRounding?: boolean;
			withBestUnit?: boolean;
		}): LineMeasure => {
			const effectiveSystem =
				convertUnits ??
				(withBestUnit ? getUnitSystemFromUnit(line.unit) : null);

			if (effectiveSystem) {
				const result = quantityToBestUnit({
					quantity: line.quantity,
					unit: line.unit,
					unitSystem: effectiveSystem,
					servings,
					withRounding,
				});

				if (result) {
					return {
						...result,
						quantity: round(result.quantity, DISPLAY_PRECISION),
					};
				}
			}

			const scaled = (line.quantity ?? 0) * servings;
			const snapped =
				line.unit && withRounding
					? snapQuantity(scaled, line.unit, { pour: true, batch: true })
					: scaled;
			const quantity = round(snapped, DISPLAY_PRECISION);
			const unit = getFormattedUnit(line.unit, quantity);

			return {
				quantity,
				unit,
				formatted: `${line.quantity ? quantityFormatter.format(quantity) : ""} ${unit}`,
			};
		},
		[quantityToBestUnit, quantityFormatter],
	);
}

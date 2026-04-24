"use client";

import { use, useCallback } from "react";
import type { DraftSpec } from "@/db/schema/specs";
import { useQuantityToBestUnit } from "@/features/units/hooks/useQuantityToBestUnit";
import type { UnitSystems } from "@/features/units/utils/convert";
import { getFormattedUnit } from "@/features/units/utils/getFormattedUnit";
import { getUnitSystemFromUnit } from "@/features/units/utils/getUnitSystemFromUnit";
import { snapQuantity } from "@/features/units/utils/snapQuantity";
import { FormatterContext } from "@/hooks/useFormatter";
import { round } from "@/utils";

/**
 * Strip IEEE-754 noise from computed quantities before they reach the display
 * (e.g. 0.75 × 10.1 = 7.574999999999999). Two decimals matches the default
 * `quantityFormatter` precision and is plenty for a pour.
 */
const DISPLAY_PRECISION = 2;

export type SpecMeasure = {
	quantity: number;
	unit: string;
	formatted: string;
};

export function useFormatSpecMeasure<T extends DraftSpec>() {
	const { quantityFormatter } = use(FormatterContext);
	const quantityToBestUnit = useQuantityToBestUnit();

	return useCallback(
		({
			spec,
			servings,
			convertUnits,
			withRounding,
			withBestUnit,
		}: {
			spec: T;
			servings: number;
			convertUnits?: UnitSystems | null;
			withRounding?: boolean;
			withBestUnit?: boolean;
		}): SpecMeasure => {
			const effectiveSystem =
				convertUnits ??
				(withBestUnit ? getUnitSystemFromUnit(spec.unit) : null);

			if (effectiveSystem) {
				const result = quantityToBestUnit({
					quantity: spec.quantity,
					unit: spec.unit,
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

			const scaled = (spec.quantity ?? 0) * servings;
			const snapped =
				spec.unit && withRounding
					? snapQuantity(scaled, spec.unit, { pour: true, batch: true })
					: scaled;
			const quantity = round(snapped, DISPLAY_PRECISION);
			const unit = getFormattedUnit(spec.unit, quantity);

			return {
				quantity,
				unit,
				formatted: `${spec.quantity ? quantityFormatter.format(quantity) : ""} ${unit}`,
			};
		},
		[quantityToBestUnit, quantityFormatter],
	);
}

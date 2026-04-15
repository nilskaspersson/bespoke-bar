"use client";

import { use, useCallback } from "react";
import type { DraftSpec } from "@/db/schema/specs";
import { useQuantityToBestUnit } from "@/features/units/hooks/useQuantityToBestUnit";
import type { UnitSystems } from "@/features/units/utils/convert";
import { getFormattedUnit } from "@/features/units/utils/getFormattedUnit";
import { FormatterContext } from "@/hooks/useFormatter";

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
			snap,
		}: {
			spec: T;
			servings: number;
			convertUnits?: UnitSystems | null;
			snap?: boolean;
		}): SpecMeasure => {
			if (convertUnits) {
				const result = quantityToBestUnit({
					quantity: spec.quantity,
					unit: spec.unit,
					unitSystem: convertUnits,
					servings,
					snap,
				});

				if (result) return result;
			}

			const quantity = (spec.quantity ?? 0) * servings;
			const unit = getFormattedUnit(spec.unit, spec.quantity);

			return {
				quantity,
				unit,
				formatted: `${spec.quantity ? quantityFormatter.format(quantity) : ""} ${unit}`,
			};
		},
		[quantityToBestUnit, quantityFormatter],
	);
}

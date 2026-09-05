import type { UnitSystems } from "@bespoke/domain/units/convert";
import { getFormattedUnit } from "@bespoke/domain/units/getFormattedUnit";
import { quantityToBestUnit } from "@bespoke/domain/units/quantityToBestUnit";
import { snapQuantity } from "@bespoke/domain/units/snapQuantity";
import type { Unit } from "@bespoke/schema/schema/units";
import { use, useCallback } from "react";
import { FormatterContext } from "../hooks/useFormatter";
import { formatMeasure } from "../hooks/useRoundedUnit";

export function useQuantityToBestUnit() {
	const { volumeFormatter } = use(FormatterContext);

	return useCallback(
		(args: {
			quantity: number | null | undefined;
			unit: Unit | null | undefined;
			unitSystem?: UnitSystems | null;
			servings?: number;
			withRounding?: boolean;
		}) => {
			const parts = quantityToBestUnit(args);
			if (!parts) return null;
			const [raw, unit] = parts;
			const quantity = args.withRounding
				? snapQuantity(raw, unit, { pour: true, batch: true })
				: raw;
			return {
				quantity,
				unit: getFormattedUnit(unit, quantity),
				formatted: formatMeasure([quantity, unit], volumeFormatter),
			};
		},
		[volumeFormatter],
	);
}

import type { UnitSystems } from "@bespoke/domain/units/convert";
import { getFormattedUnit } from "@bespoke/domain/units/getFormattedUnit";
import { type MeasureParts, roundUnit } from "@bespoke/domain/units/roundUnit";
import { FormatterContext } from "@bespoke/ui/hooks/useFormatter";
import { use, useCallback } from "react";

export function formatMeasure(
	parts: MeasureParts,
	formatter: Intl.NumberFormat,
): string {
	const [quantity, unit] = parts;
	return `${formatter.format(quantity)} ${getFormattedUnit(unit, quantity)}`;
}

export function useRoundedUnit() {
	const { volumeFormatter } = use(FormatterContext);

	return useCallback(
		(volumeInMl: number, unitSystem: UnitSystems | null | undefined) => {
			const parts = roundUnit(volumeInMl, unitSystem);
			return formatMeasure(parts, volumeFormatter);
		},
		[volumeFormatter],
	);
}

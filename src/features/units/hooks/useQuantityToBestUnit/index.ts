import { use, useCallback } from "react";
import type { Unit } from "@/db/schema/units";
import { DB_UNIT_TO_LIB_UNIT } from "@/features/units/constants";
import {
	formatMeasure,
	type MeasureParts,
	roundUnit,
} from "@/features/units/hooks/useRoundedUnit";
import {
	convertFactor,
	type UnitSystems,
} from "@/features/units/utils/convert";
import { getFormattedUnit } from "@/features/units/utils/getFormattedUnit";
import { getUnitSystemFromUnit } from "@/features/units/utils/getUnitSystemFromUnit";
import { snapQuantity } from "@/features/units/utils/snapQuantity";
import { FormatterContext } from "@/hooks/useFormatter";

export function quantityToBestUnit({
	quantity,
	unit,
	unitSystem,
	servings = 1,
}: {
	quantity: number | null | undefined;
	unit: Unit | null | undefined;
	unitSystem?: UnitSystems | null;
	servings?: number;
}): MeasureParts | null {
	if (!quantity || !unit) return null;

	const qty = quantity * servings;
	const libUnit = DB_UNIT_TO_LIB_UNIT.get(unit);

	if (!libUnit) return [qty, unit];

	const volumeInMl = qty * convertFactor(libUnit, "ml");
	const nativeUnitSystem = getUnitSystemFromUnit(unit);

	if (nativeUnitSystem === "bartending" && volumeInMl <= 10) {
		return [qty, unit];
	}

	return roundUnit(volumeInMl, unitSystem);
}

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

import { useCallback } from "react";
import type { Unit } from "@/db/schema/units";
import { DB_UNIT_TO_LIB_UNIT } from "@/features/units/constants";
import { useRoundedUnit } from "@/features/units/hooks/useRoundedUnit";
import { convert, type UnitSystems } from "@/features/units/utils/convert";
import { getFormattedUnit } from "@/features/units/utils/getFormattedUnit";
import { getUnitSystemFromUnit } from "@/features/units/utils/getUnitSystemFromUnit";

export function quantityToBestUnit({
	quantity,
	unit,
	unitSystem,
	servings = 1,
	roundUnit,
}: {
	quantity: number | null | undefined;
	unit: Unit | null | undefined;
	unitSystem?: UnitSystems | null;
	servings?: number;
	roundUnit: (
		volumeInMl: number,
		unitSystem: UnitSystems | null | undefined,
	) => string;
}) {
	if (!quantity) {
		return "";
	}

	const qty = quantity * servings;

	if (!unit) {
		return qty.toString();
	}

	const libUnit = DB_UNIT_TO_LIB_UNIT.get(unit);

	if (!libUnit) {
		return qty.toString();
	}

	const volumeInMl = convert(qty).from(libUnit).to("ml");

	const nativeUnitSystem = getUnitSystemFromUnit(unit);

	if (nativeUnitSystem === "bartending" && volumeInMl <= 10) {
		return `${qty} ${getFormattedUnit(unit, qty)}`;
	}

	return roundUnit(volumeInMl, unitSystem);
}

export function useQuantityToBestUnit() {
	const roundUnit = useRoundedUnit();

	return useCallback(
		({
			quantity,
			unit,
			unitSystem,
			servings = 1,
		}: {
			quantity: number | null | undefined;
			unit: Unit | null | undefined;
			unitSystem?: UnitSystems | null;
			servings?: number;
		}) =>
			quantityToBestUnit({ quantity, unit, unitSystem, servings, roundUnit }),
		[roundUnit],
	);
}

import type { Unit } from "@bespoke/schema/schema/units";
import { DB_UNIT_TO_LIB_UNIT } from "./constants";
import { convertFactor, type UnitSystems } from "./convert";
import { getUnitSystemFromUnit } from "./getUnitSystemFromUnit";
import { type MeasureParts, roundUnit } from "./roundUnit";

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

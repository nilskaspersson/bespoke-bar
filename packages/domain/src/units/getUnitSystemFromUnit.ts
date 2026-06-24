import type { Unit } from "@bespoke/schema/schema/units";
import { DB_UNIT_TO_LIB_UNIT } from "./constants";
import { convert, isValidUnitSystem, type UnitSystems } from "./convert";

export function getUnitSystemFromUnit(
	unit: Unit | null | undefined,
): UnitSystems | null {
	if (!unit) {
		return null;
	}

	const libUnit = DB_UNIT_TO_LIB_UNIT.get(unit);

	if (!libUnit) {
		return null;
	}

	const system = convert().describe(libUnit).system;

	if (!isValidUnitSystem(system)) {
		return null;
	}

	return system;
}

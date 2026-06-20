import type { Unit } from "@/db/schema/units";
import { DB_UNIT_TO_LIB_UNIT } from "@/features/units/constants";
import {
	convert,
	isValidUnitSystem,
	type UnitSystems,
} from "@/features/units/utils/convert";

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

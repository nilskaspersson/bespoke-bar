import type { Measurement, Unit } from "@bespoke/schema/schema/units";
import { DB_UNIT_TO_LIB_UNIT } from "./constants";
import { convert } from "./convert";
import { isMeasurementType } from "./predicates";

export function getMeasurementFromUnit(
	unit: Unit | null | undefined,
): Measurement | null {
	if (!unit) {
		return null;
	}

	const libUnit = DB_UNIT_TO_LIB_UNIT.get(unit);

	if (!libUnit) {
		return null;
	}

	const libMeasurement = convert().describe(libUnit).measure;

	if (!isMeasurementType(libMeasurement)) {
		return null;
	}

	return libMeasurement;
}

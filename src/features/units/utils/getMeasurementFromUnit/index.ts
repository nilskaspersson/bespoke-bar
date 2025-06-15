import {
	type Measurement,
	supportedMeasurements,
	type Unit,
} from "@/db/schema/units";
import { DB_UNIT_TO_LIB_UNIT } from "@/features/units/constants";
import { convert } from "@/features/units/utils/convert";

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

	const measurement = supportedMeasurements.parse(libMeasurement);

	return measurement;
}

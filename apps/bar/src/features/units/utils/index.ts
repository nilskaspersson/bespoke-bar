import type { Measurement, Unit } from "@bespoke/schema/schema/units";
import {
	supportedMeasurements,
	supportedUnits,
} from "@bespoke/schema/schema/units";
import { BARTENDING_UNITS } from "@/features/units/constants";
import type { BartendingUnits } from "@/features/units/constants/volume";

export function isBartendingUnit(unit: unknown): unit is BartendingUnits {
	return BARTENDING_UNITS.has(unit as BartendingUnits);
}

export function isMeasurementType(o: unknown): o is Measurement {
	return supportedMeasurements.safeParse(o).success;
}

export function isValidUnit(o: unknown): o is Unit {
	return supportedUnits.safeParse(o).success;
}

export function getMeasurementPriceUnit(measurement: unknown): string {
	if (!isMeasurementType(measurement)) {
		return "unit";
	}

	switch (measurement) {
		case "volume":
			return "liter";
		case "mass":
			return "kg";
		case "pieces":
			return "piece";
		default:
			return "unit";
	}
}

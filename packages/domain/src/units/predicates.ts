import {
	MEASUREMENT_TYPES,
	type Measurement,
	UNITS,
	type Unit,
} from "@bespoke/schema/schema/units";
import { BARTENDING_UNITS } from "./constants";
import type { BartendingUnits } from "./volume";

export function isBartendingUnit(unit: unknown): unit is BartendingUnits {
	return BARTENDING_UNITS.has(unit as BartendingUnits);
}

export function isMeasurementType(o: unknown): o is Measurement {
	return (MEASUREMENT_TYPES as readonly unknown[]).includes(o);
}

export function isValidUnit(o: unknown): o is Unit {
	return (UNITS as readonly unknown[]).includes(o);
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

import type { Measurement } from "@bespoke/schema/schema/units";

export const MEASUREMENT_TO_DB_INGREDIENT_UNIT = new Map<Measurement, string>([
	["volume", "l"],
	["mass", "kg"],
	["pieces", "pc"],
]);

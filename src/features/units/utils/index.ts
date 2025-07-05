import { BARTENDING_UNITS } from "@/features/units/constants";
import type { BartendingUnits } from "@/features/units/constants/volume";

export function isBartendingUnit(unit: unknown): unit is BartendingUnits {
	return BARTENDING_UNITS.has(unit as BartendingUnits);
}

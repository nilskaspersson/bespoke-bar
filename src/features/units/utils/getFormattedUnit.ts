import type { Unit } from "@/db/schema/units";
import { DB_UNIT_TO_LIB_UNIT } from "@/features/units/constants";
import { convert } from "@/features/units/utils/convert";

export function getFormattedUnit(
	unit: Unit | null | undefined,
	quantity: number | null | undefined,
): string {
	if (!unit) {
		return "";
	}

	const libUnit = DB_UNIT_TO_LIB_UNIT.get(unit);

	if (!libUnit) {
		return "";
	}

	const unitData = convert().describe(libUnit);

	switch (unit) {
		case "fl_oz":
			return "fl oz";

		case "cl":
		case "ml":
		case "dl":
			return unitData.abbr;

		default:
			return quantity === 1 ? unitData.singular : unitData.plural;
	}
}

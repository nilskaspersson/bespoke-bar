import type { Unit } from "@/db/schema/units";

export function formatUnit(unit: Unit | null | undefined): string {
	if (!unit) {
		return "";
	}

	return unit === "fl_oz" ? "fl oz" : unit;
}

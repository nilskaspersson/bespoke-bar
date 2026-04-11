import type { Unit } from "@/db/schema/units";
import { getUnitSystemFromUnit } from "@/features/units/utils/getUnitSystemFromUnit";

/**
 * Snap a quantity to bartender-friendly increments:
 * - Imperial (fl oz, cups, etc.): nearest 0.25
 * - Metric cl/dl/l: nearest 0.5
 * - Metric ml: nearest 5 (≥10ml) or nearest 1 (<10ml)
 * - Bartending (dash, barspoon, etc.): whole numbers
 */
export function snapQuantity(qty: number, unit: Unit): number {
	const system = getUnitSystemFromUnit(unit);

	if (system === "bartending") return Math.round(qty);
	if (system === "imperial") return Math.round(qty * 4) / 4;

	if (unit === "ml") {
		return qty >= 10 ? Math.round(qty / 5) * 5 : Math.round(qty);
	}

	return Math.round(qty * 2) / 2;
}

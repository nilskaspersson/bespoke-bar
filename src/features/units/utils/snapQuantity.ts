import type { Unit } from "@/db/schema/units";
import { DB_UNIT_TO_LIB_UNIT } from "@/features/units/constants";
import { convert } from "@/features/units/utils/convert";
import { getUnitSystemFromUnit } from "@/features/units/utils/getUnitSystemFromUnit";
import { round } from "@/utils";

/**
 * Snap a quantity to a bartender-friendly increment, measured against the
 * **base unit** of its system rather than the display unit. The display
 * unit is a presentation choice; the underlying precision shouldn't get
 * coarser just because we scaled up for a batch or punch.
 *
 * - Metric volume   → 5 ml (≥10 ml) / 1 ml (<10 ml), always evaluated
 *                     against the ml value. `5.6 l` stays `5.6 l`
 *                     (5600 ml → 5600 ml), `1.5 cl` stays `1.5 cl`
 *                     (15 ml → 15 ml), and `1.23 l` snaps to `1.225 l`
 *                     (1230 ml → 1230 ml) because the rounding happens
 *                     at drink-pour scale regardless of the display unit.
 * - Imperial volume → nearest ¼ fl oz, always evaluated against the
 *                     fl-oz value. `5.6 gal` stays approximately `5.6 gal`
 *                     rather than collapsing to a quarter-gallon.
 * - Bartending      → whole numbers (you can't pour half a dash).
 */
export function snapQuantity(qty: number, unit: Unit): number {
	const system = getUnitSystemFromUnit(unit);

	if (system === "bartending") return Math.round(qty);

	const libUnit = DB_UNIT_TO_LIB_UNIT.get(unit);
	if (!libUnit) return qty;

	if (system === "metric") {
		const ml = convert(qty).from(libUnit).to("ml");
		const snappedMl = ml >= 10 ? Math.round(ml / 5) * 5 : Math.round(ml);
		return round(convert(snappedMl).from("ml").to(libUnit), 6);
	}

	const oz = convert(qty).from(libUnit).to("fl-oz");
	const snappedOz = Math.round(oz * 4) / 4;
	return round(convert(snappedOz).from("fl-oz").to(libUnit), 6);
}

import type { Unit } from "@bespoke/schema/schema/units";
import { getUnitSystemFromUnit } from "@/features/units/utils/getUnitSystemFromUnit";
import { round } from "@/utils";

export type SnapOptions = {
	/**
	 * Snap to typical measuring increments for the **display** unit: 0.25 fl oz,
	 * 0.25 cup, 0.25 qt, 0.25 gal, 5 ml (or 1 ml under 10 ml), 0.5 cl, 0.5 dl,
	 * 0.1 L, whole bartending units. The grid coarsens with the display unit
	 * because nobody measures a 5 ml difference at liter scale — "4.95 dl" just
	 * becomes "5 dl".
	 */
	pour?: boolean;
	/**
	 * Round to a magnitude-appropriate grid (3 significant figures of the
	 * **display** quantity). Aimed at batch-scale work where the last few
	 * decimals stop being actionable — 173.25 fl oz → 173, 3.8672 qt → 3.87,
	 * 5.5996 gal → 5.60. Paired with unit-system promotion upstream (see
	 * `useFormatLineMeasure`) so the unit itself switches at scale.
	 */
	batch?: boolean;
};

/**
 * Snap a quantity to a pour grid, a batch-rounding grid, or both.
 */
export function snapQuantity(
	qty: number,
	unit: Unit,
	opts: SnapOptions = {},
): number {
	const { pour, batch } = opts;
	if (!pour && !batch) return qty;

	let result = qty;

	if (pour) {
		const step = pourStepForUnit(unit, qty);
		if (step > 0) {
			const snapped = Math.round(result / step) * step;
			/**
			 * Never round a non-zero quantity down to zero.
			 */
			result = snapped === 0 && qty !== 0 ? step : snapped;
		}
	}

	if (batch && result !== 0) {
		result = Number(result.toPrecision(3));
	}

	return round(result, 6);
}

function pourStepForUnit(unit: Unit, qty: number): number {
	switch (unit) {
		case "ml":
			return Math.abs(qty) >= 10 ? 5 : 1;
		case "cl":
			return 0.5;
		case "dl":
			return 0.5;
		case "l":
			return 0.1;
		case "fl_oz":
		case "cup":
		case "qt":
		case "gal":
		case "tsp":
		case "tbsp":
			return 0.25;
		default:
			return getUnitSystemFromUnit(unit) === "bartending" ? 1 : 0;
	}
}

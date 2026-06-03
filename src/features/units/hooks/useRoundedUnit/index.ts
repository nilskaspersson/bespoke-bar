import { use, useCallback } from "react";
import type { Unit } from "@/db/schema/units";
import {
	convertFactor,
	type UnitSystems,
} from "@/features/units/utils/convert";
import { getFormattedUnit } from "@/features/units/utils/getFormattedUnit";
import { FormatterContext } from "@/hooks/useFormatter";
import { round } from "@/utils";

export type MeasureParts = [quantity: number, unit: Unit];

export function roundUnit(
	volumeInMl: number,
	unitSystem: UnitSystems | null | undefined,
): MeasureParts {
	if (volumeInMl === 0) {
		return unitSystem === "metric" ? [0, "ml"] : [0, "fl_oz"];
	}

	if (unitSystem === "imperial") {
		const flOz = volumeInMl * convertFactor("ml", "fl-oz");

		if (flOz >= 128) {
			return [round(flOz * convertFactor("fl-oz", "gal")), "gal"];
		}

		if (flOz >= 64) {
			return [round(flOz * convertFactor("fl-oz", "qt")), "qt"];
		}

		if (flOz >= 8) {
			return [round(flOz * convertFactor("fl-oz", "cup")), "cup"];
		}

		if (flOz >= 0.5) {
			return [round(flOz), "fl_oz"];
		}

		/**
		 * Below half a fl-oz, fl-oz reads as a fraction smaller than the pour
		 * grid (0.25 fl-oz). Drop to tsp so tiny imperial pours stay legible —
		 * "0.5 tsp" rather than "0.08 fl oz".
		 */
		return [round(volumeInMl * convertFactor("ml", "tsp")), "tsp"];
	}

	if (volumeInMl >= 1000) {
		return [round(volumeInMl * convertFactor("ml", "l")), "l"];
	}

	if (volumeInMl >= 200) {
		return [round(volumeInMl * convertFactor("ml", "dl")), "dl"];
	}

	if (volumeInMl >= 10) {
		return [round(volumeInMl * convertFactor("ml", "cl")), "cl"];
	}

	return [round(volumeInMl), "ml"];
}

export function formatMeasure(
	parts: MeasureParts,
	formatter: Intl.NumberFormat,
): string {
	const [quantity, unit] = parts;
	return `${formatter.format(quantity)} ${getFormattedUnit(unit, quantity)}`;
}

export function useRoundedUnit() {
	const { volumeFormatter } = use(FormatterContext);

	return useCallback(
		(volumeInMl: number, unitSystem: UnitSystems | null | undefined) => {
			const parts = roundUnit(volumeInMl, unitSystem);
			return formatMeasure(parts, volumeFormatter);
		},
		[volumeFormatter],
	);
}

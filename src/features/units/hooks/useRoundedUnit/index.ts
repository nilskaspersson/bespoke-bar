import { use, useCallback } from "react";
import type { Unit } from "@/db/schema/units";
import { convert, type UnitSystems } from "@/features/units/utils/convert";
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
		const flOz = convert(volumeInMl).from("ml").to("fl-oz");

		if (flOz >= 128) {
			return [round(convert(flOz).from("fl-oz").to("gal")), "gal"];
		}

		if (flOz >= 64) {
			return [round(convert(flOz).from("fl-oz").to("qt")), "qt"];
		}

		if (flOz >= 8) {
			return [round(convert(flOz).from("fl-oz").to("cup")), "cup"];
		}

		return [round(flOz), "fl_oz"];
	}

	if (volumeInMl >= 1000) {
		return [round(convert(volumeInMl).from("ml").to("l")), "l"];
	}

	if (volumeInMl >= 200) {
		return [round(convert(volumeInMl).from("ml").to("dl")), "dl"];
	}

	if (volumeInMl >= 10) {
		return [round(convert(volumeInMl).from("ml").to("cl")), "cl"];
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

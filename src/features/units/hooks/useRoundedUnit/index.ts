import { use, useCallback } from "react";
import { convert, type UnitSystems } from "@/features/units/utils/convert";
import { getFormattedUnit } from "@/features/units/utils/getFormattedUnit";
import { FormatterContext } from "@/hooks/useFormatter";

export function roundUnit(
	volumeInMl: number,
	unitSystem: UnitSystems | null | undefined,
	volumeFormatter: Intl.NumberFormat,
) {
	if (volumeInMl === 0) return unitSystem === "metric" ? "0 ml" : "0 fl oz";

	if (unitSystem === "imperial") {
		const flOz = convert(volumeInMl).from("ml").to("fl-oz");

		if (flOz >= 128) {
			const gallons = convert(flOz).from("fl-oz").to("gal");
			return `${volumeFormatter.format(gallons)} ${getFormattedUnit("gal", gallons)}`;
		}

		if (flOz >= 64) {
			const quarts = convert(flOz).from("fl-oz").to("qt");
			return `${volumeFormatter.format(quarts)} ${getFormattedUnit("qt", quarts)}`;
		}

		if (flOz >= 8) {
			const cups = convert(flOz).from("fl-oz").to("cup");
			return `${volumeFormatter.format(cups)} ${getFormattedUnit("cup", cups)}`;
		}

		return `${volumeFormatter.format(flOz)} ${getFormattedUnit("fl_oz", flOz)}`;
	}

	if (volumeInMl >= 1000) {
		const liters = convert(volumeInMl).from("ml").to("l");
		return `${volumeFormatter.format(liters)} ${getFormattedUnit("l", liters)}`;
	}

	if (volumeInMl >= 200) {
		const deciliters = convert(volumeInMl).from("ml").to("dl");
		return `${volumeFormatter.format(deciliters)} ${getFormattedUnit("dl", deciliters)}`;
	}

	if (volumeInMl >= 10) {
		const centiliters = convert(volumeInMl).from("ml").to("cl");
		return `${volumeFormatter.format(centiliters)} ${getFormattedUnit("cl", centiliters)}`;
	}

	return `${volumeFormatter.format(volumeInMl)} ${getFormattedUnit("ml", volumeInMl)}`;
}

export function useRoundedUnit(): (
	volumeInMl: number,
	unitSystem: UnitSystems | null | undefined,
) => string {
	const { volumeFormatter } = use(FormatterContext);

	return useCallback(
		(volumeInMl: number, unitSystem: UnitSystems | null | undefined) =>
			roundUnit(volumeInMl, unitSystem, volumeFormatter),
		[volumeFormatter],
	);
}

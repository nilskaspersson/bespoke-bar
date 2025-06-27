import type { Unit } from "@/db/schema/units";
import { convert } from "@/features/units/utils/convert";
import { volumeFormatter } from "@/utils/formatting";

export function formatVolume(
	volumeInMl: number,
	unitSystem: "metric" | "imperial" = "metric",
): string {
	if (volumeInMl === 0) return unitSystem === "metric" ? "0 ml" : "0 fl oz";

	if (unitSystem === "imperial") {
		const flOz = convert(volumeInMl).from("ml").to("fl-oz");

		if (flOz >= 32) {
			const quarts = convert(flOz).from("fl-oz").to("qt");
			return `${volumeFormatter.format(quarts)} qt`;
		}

		if (flOz >= 16) {
			const pints = convert(flOz).from("fl-oz").to("pnt");
			return `${volumeFormatter.format(pints)} pt`;
		}

		if (flOz >= 8) {
			const cups = convert(flOz).from("fl-oz").to("cup");
			return `${volumeFormatter.format(cups)} cup`;
		}

		return `${volumeFormatter.format(flOz)} fl oz`;
	}

	if (volumeInMl >= 1000) {
		const liters = convert(volumeInMl).from("ml").to("l");
		return `${volumeFormatter.format(liters)} l`;
	}

	if (volumeInMl >= 100) {
		const centiliters = convert(volumeInMl).from("ml").to("cl");
		return `${volumeFormatter.format(centiliters)} cl`;
	}

	return `${volumeFormatter.format(volumeInMl)} ml`;
}

export function quantityToBestUnit(
	quantity: number | null | undefined,
	unit: Unit | null | undefined,
	unitSystem: "metric" | "imperial" = "metric",
): string {
	if (!quantity) {
		return "";
	}

	if (!unit) {
		return quantity.toString();
	}

	const volumeInMl = convert(quantity).from(unit).to("ml");
	return formatVolume(volumeInMl, unitSystem);
}

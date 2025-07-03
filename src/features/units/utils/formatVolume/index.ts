import type { Unit } from "@/db/schema/units";
import { DB_UNIT_TO_LIB_UNIT } from "@/features/units/constants";
import { convert, type UnitSystems } from "@/features/units/utils/convert";
import { volumeFormatter } from "@/utils/formatting";

export function formatVolume(
	volumeInMl: number,
	unitSystem: UnitSystems | null = "metric",
): string {
	if (volumeInMl === 0) return unitSystem === "metric" ? "0 ml" : "0 fl oz";

	if (unitSystem === "imperial") {
		const flOz = convert(volumeInMl).from("ml").to("fl-oz");

		if (flOz >= 128) {
			const gallons = convert(flOz).from("fl-oz").to("gal");
			return `${volumeFormatter.format(gallons)} gal`;
		}

		if (flOz >= 64) {
			const quarts = convert(flOz).from("fl-oz").to("qt");
			return `${volumeFormatter.format(quarts)} qt`;
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

	if (volumeInMl >= 200) {
		const deciliters = convert(volumeInMl).from("ml").to("dl");
		return `${volumeFormatter.format(deciliters)} dl`;
	}

	if (volumeInMl >= 10) {
		const centiliters = convert(volumeInMl).from("ml").to("cl");
		return `${volumeFormatter.format(centiliters)} cl`;
	}

	return `${volumeFormatter.format(volumeInMl)} ml`;
}

export function quantityToBestUnit({
	quantity,
	unit,
	unitSystem = "metric",
	servings = 1,
}: {
	quantity: number | null | undefined;
	unit: Unit | null | undefined;
	unitSystem?: "metric" | "imperial";
	servings?: number;
}): string {
	if (!quantity) {
		return "";
	}

	const q = quantity * servings;

	if (!unit) {
		return q.toString();
	}

	const libUnit = DB_UNIT_TO_LIB_UNIT.get(unit);

	if (!libUnit) {
		return q.toString();
	}

	const volumeInMl = convert(q).from(libUnit).to("ml");

	return formatVolume(volumeInMl, unitSystem);
}

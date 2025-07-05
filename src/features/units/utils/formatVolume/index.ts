import type { Unit } from "@/db/schema/units";
import { DB_UNIT_TO_LIB_UNIT } from "@/features/units/constants";
import { convert, type UnitSystems } from "@/features/units/utils/convert";
import { getFormattedUnit } from "@/features/units/utils/getFormattedUnit";
import { getUnitSystemFromUnit } from "@/features/units/utils/getUnitSystemFromUnit";
import { volumeFormatter } from "@/utils/formatting";

export function formatVolume(
	volumeInMl: number,
	unitSystem: UnitSystems | null | undefined,
): string {
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

export function quantityToBestUnit({
	quantity,
	unit,
	unitSystem,
	servings = 1,
}: {
	quantity: number | null | undefined;
	unit: Unit | null | undefined;
	unitSystem?: UnitSystems | null;
	servings?: number;
}): string {
	if (!quantity) {
		return "";
	}

	const qty = quantity * servings;

	if (!unit) {
		return qty.toString();
	}

	const libUnit = DB_UNIT_TO_LIB_UNIT.get(unit);

	if (!libUnit) {
		return qty.toString();
	}

	const volumeInMl = convert(qty).from(libUnit).to("ml");

	const nativeUnitSystem = getUnitSystemFromUnit(unit);

	if (nativeUnitSystem === "bartending" && volumeInMl <= 10) {
		return `${qty} ${getFormattedUnit(unit, qty)}`;
	}

	return formatVolume(volumeInMl, unitSystem);
}

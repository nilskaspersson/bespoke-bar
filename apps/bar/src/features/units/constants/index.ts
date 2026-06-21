import { supportedUnits, type Unit } from "@bespoke/schema/schema/units";
import { collator } from "@/utils/collator";
import { createSearchIndex } from "@/utils/search";

const UNIT_TO_LABEL = new Map<Unit, string>([
	["cl", "cl"],
	["cup", "cup"],
	["dl", "dl"],
	["fl_oz", "fl oz"],
	["l", "liter"],
	["ml", "ml"],
	["tbsp", "tbsp"],
	["tsp", "tsp"],
	["gal", "gal"],
	["qt", "qt"],
	["dash", "Dash"],
	["barspoon", "Bar spoon"],
	["rinse", "Rinse"],
	["drop", "Drop"],
	["float", "Float"],
	["spray", "Spray"],
]);

export function getUnitLabel(unit: Unit): string {
	return UNIT_TO_LABEL.get(unit) ?? unit;
}

/**
 * Supported units sorted alphabetically by their display label. Shared by
 * the recipe-editor unit picker + typeahead so both lists agree on order.
 */
export const SORTED_UNITS: Unit[] = supportedUnits.options.toSorted((a, b) =>
	collator.compare(getUnitLabel(a), getUnitLabel(b)),
);

export const UNIT_SEARCH_INDEX = createSearchIndex(
	SORTED_UNITS,
	(u) => u,
	(u) => [getUnitLabel(u), u],
);

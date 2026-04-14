import { supportedUnits, type Unit } from "@/db/schema/units";
import type {
	BartendingUnits,
	VolumeUnits,
} from "@/features/units/constants/volume";
import { invertMapToSets } from "@/utils";
import { collator } from "@/utils/collator";

/**
 * A map of our database units to the units supported by `convert-units`.
 */
export const DB_UNIT_TO_LIB_UNIT = new Map<Unit, VolumeUnits>([
	["cl", "cl"],
	["cup", "cup"],
	["dl", "dl"],
	["fl_oz", "fl-oz"],
	["l", "l"],
	["ml", "ml"],
	["tbsp", "Tbs"],
	["tsp", "tsp"],
	["gal", "gal"],
	["qt", "qt"],
	["dash", "dash"],
	["barspoon", "barspoon"],
	["rinse", "rinse"],
	["drop", "drop"],
	["float", "float"],
	["spray", "spray"],
]);

/**
 * Common input aliases to our database units.
 */
export const ALIAS_TO_DB_VOLUME_UNIT = new Map<string, Unit>([
	// Centiliters
	["cl", "cl"],
	["cls", "cl"],
	["centiliter", "cl"],
	["centilitre", "cl"],
	["centiliters", "cl"],
	["centilitres", "cl"],

	// Deciliter
	["dl", "dl"],
	["dls", "dl"],
	["deciliter", "dl"],
	["decilitre", "dl"],
	["deciliters", "dl"],
	["decilitres", "dl"],

	// Cups
	["cup", "cup"],
	["cups", "cup"],

	// Fluid ounces
	["fl_oz", "fl_oz"],
	["fl-oz", "fl_oz"],
	["fl oz", "fl_oz"],
	["fl.oz.", "fl_oz"],
	["floz", "fl_oz"],
	["fluid ounce", "fl_oz"],
	["fluid ounces", "fl_oz"],
	/**
	 * !!! Default "oz" to fluid ounces !!!
	 */
	["ounce", "fl_oz"],
	["ounces", "fl_oz"],
	["oz", "fl_oz"],
	["oz.", "fl_oz"],

	// Liters
	["l", "l"],
	["liter", "l"],
	["litre", "l"],
	["liters", "l"],
	["litres", "l"],

	// Milliliters
	["ml", "ml"],
	["mls", "ml"],
	["milliliter", "ml"],
	["millilitre", "ml"],
	["milliliters", "ml"],
	["millilitres", "ml"],

	// Tablespoons
	["tbsp", "tbsp"],
	["tablespoon", "tbsp"],
	["tablespoons", "tbsp"],
	["tbs", "tbsp"],

	// Teaspoons
	["tsp", "tsp"],
	["teaspoon", "tsp"],
	["teaspoons", "tsp"],

	// Gallons
	["gal", "gal"],
	["gallon", "gal"],
	["gallons", "gal"],

	// Quarts
	["qt", "qt"],
	["quart", "qt"],
	["quarts", "qt"],

	/**
	 * Bartending units
	 */
	["dash", "dash"],
	["dashes", "dash"],
	["barspoon", "barspoon"],
	["barspoons", "barspoon"],
	["bsp", "barspoon"],
	["bsps", "barspoon"],
	["bar spoon", "barspoon"],
	["bar spoons", "barspoon"],
	["rinse", "rinse"],
	["wash", "rinse"],
	["drop", "drop"],
	["drip", "drop"],
	["drops", "drop"],
	["float", "float"],
	["layer", "float"],
	["spray", "spray"],
	["mist", "spray"],
	["spritz", "spray"],
]);

export const DB_VOLUME_UNIT_TO_ALIASES = invertMapToSets(
	ALIAS_TO_DB_VOLUME_UNIT,
);

export const BARTENDING_UNITS = new Set<BartendingUnits>([
	"dash",
	"barspoon",
	"rinse",
	"drop",
	"float",
	"spray",
]);

export const UNIT_TO_LABEL = new Map<Unit, string>([
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

/**
 * Supported units sorted alphabetically by their display label. Shared by
 * the recipe-editor unit picker + typeahead so both lists agree on order.
 */
export const SORTED_UNITS: Unit[] = [...supportedUnits.options].sort((a, b) =>
	collator.compare(UNIT_TO_LABEL.get(a) ?? a, UNIT_TO_LABEL.get(b) ?? b),
);

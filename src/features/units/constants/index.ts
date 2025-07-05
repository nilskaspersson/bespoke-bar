import type { Unit } from "@/db/schema/units";
import type {
	BartendingUnits,
	VolumeUnits,
} from "@/features/units/constants/volume";
import { invertMapToSets } from "@/utils";

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

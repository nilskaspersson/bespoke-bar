import type { VolumeUnits } from "convert-units/definitions/volume";
import type { Unit } from "@/db/schema/units";
import { invertMapToSets } from "@/utils";

/**
 * A map of our database units to the units supported by `convert-units`.
 */
export const DB_VOLUME_UNIT_TO_LIB_UNIT = new Map<Unit, VolumeUnits>([
	["cl", "cl"],
	["cup", "cup"],
	["fl_oz", "fl-oz"],
	["l", "l"],
	["ml", "ml"],
	["tbsp", "Tbs"],
	["tsp", "tsp"],
]);

/**
 * Common input aliases to our database units.
 */
export const ALIAS_TO_DB_VOLUME_UNIT = new Map<string, Unit>([
	// Centiliters
	["cl", "cl"],
	["centiliter", "cl"],
	["centilitre", "cl"],
	["centiliters", "cl"],
	["centilitres", "cl"],

	// Cups
	["cup", "cup"],
	["cups", "cup"],

	// Fluid ounces
	["fl_oz", "fl_oz"],
	["fl-oz", "fl_oz"],
	["fl oz", "fl_oz"],
	["fluid ounce", "fl_oz"],
	["fluid ounces", "fl_oz"],
	["ounce", "fl_oz"],
	["ounces", "fl_oz"],
	["oz", "fl_oz"], // !!! Default "oz" to fluid ounces !!!

	// Liters
	["l", "l"],
	["liter", "l"],
	["litre", "l"],
	["liters", "l"],
	["litres", "l"],

	// Milliliters
	["ml", "ml"],
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
]);

export const DB_VOLUME_UNIT_TO_ALIASES = invertMapToSets(
	ALIAS_TO_DB_VOLUME_UNIT,
);

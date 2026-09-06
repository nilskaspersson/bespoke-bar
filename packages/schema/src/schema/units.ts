import { z } from "zod";

/**
 * These are some of the volume units from `convert-units`. We are likely going to
 * want to extend this to include "oz" as a common shorthand for "fl-oz". We are
 * likely going to want to add things like "barspoon" and "dash" as custom units.
 */
export const UNITS = [
	"cl",
	"dl",
	"cup",
	"fl_oz",
	"l",
	"ml",
	"tbsp",
	"tsp",
	"gal",
	"qt",

	/**
	 * Informal
	 */
	"barspoon",
	"dash",
	"rinse",
	"float",
	"drop",
	"spray",
] as const;

export const supportedUnits = z.enum(UNITS);

export type Unit = z.infer<typeof supportedUnits>;

/**
 * These measurements roughly align with some measurement of `convert-units`. While
 * the majority of ingredients will be volume, it can make sense to have mass
 * conversions for sugars, etc.
 */
export const MEASUREMENT_TYPES = ["volume", "mass", "pieces"] as const;

export const supportedMeasurements = z.enum(MEASUREMENT_TYPES);

export type Measurement = z.infer<typeof supportedMeasurements>;

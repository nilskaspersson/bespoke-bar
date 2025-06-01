import { pgEnum } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import type { z } from "zod/v4";

/**
 * These are some of the volume units from `convert-units`. We are likely going to
 * want to extend this to include "oz" as a common shorthand for "fl-oz". We are
 * likely going to want to add things like "barspoon" and "dash" as custom units.
 */
export const unitEnum = pgEnum("unit", [
	"cl",
	"cup",
	"fl_oz",
	"l",
	"ml",
	"tbsp",
	"tsp",
]);

export const supportedUnits = createSelectSchema(unitEnum);

export type Unit = z.infer<typeof supportedUnits>;

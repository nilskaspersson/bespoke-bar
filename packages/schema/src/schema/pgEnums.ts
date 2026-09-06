import { pgEnum } from "drizzle-orm/pg-core";
import { SYSTEM_CATEGORIES } from "./categories";
import { COCKTAIL_STYLES } from "./cocktailStyles";
import { GLASSWARES } from "./glassware";
import { ICE_TYPES } from "./ice";
import { PREPARATION_METHODS } from "./preparationMethods";
import { MEASUREMENT_TYPES, UNITS } from "./units";

export const unitEnum = pgEnum("unit", UNITS);

export const measurementTypes = pgEnum("measurement_type", MEASUREMENT_TYPES);

export const systemCategoryEnum = pgEnum("system_category", SYSTEM_CATEGORIES);

export const cocktailStylesEnum = pgEnum("cocktail_styles", COCKTAIL_STYLES);

export const glasswareEnum = pgEnum("glassware", GLASSWARES);

export const iceEnum = pgEnum("ice", ICE_TYPES);

export const preparationMethodEnum = pgEnum(
	"preparation_method",
	PREPARATION_METHODS,
);

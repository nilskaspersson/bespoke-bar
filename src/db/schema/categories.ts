import { pgEnum } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import type { z } from "zod";

export const systemCategoryEnum = pgEnum("system_category", [
	"absinthe",
	"aquavit",
	"armagnac",
	"baijiu",
	"bourbon",
	"brandy",
	"cachaca",
	"calvados",
	"cognac",
	"gin",
	"genever",
	"grappa",
	"mezcal",
	"pisco",
	"rum",
	"rye",
	"shochu",
	"tequila",
	"vodka",
	"whiskey",

	// Fortified & Aromatized Wines
	"vermouth",
	"sherry",
	"port",
	"aperitif",
	"sake",

	// Liqueurs
	"amaro",
	"bitters",
	"liqueur",
	"herbal_liqueur",

	// Wine & Beer
	"wine",
	"champagne",
	"beer",

	// Fresh Ingredients
	"citrus",
	"fruit",
	"herb",

	// Misc
	"cocktail_bitters",
	"egg",
	"syrup",
	"soda",
	"dairy",
	"juice",
	"honey",
	"garnish",
	"other",
]);

export const systemCategories = createSelectSchema(systemCategoryEnum);

export type SystemCategory = z.infer<typeof systemCategories>;

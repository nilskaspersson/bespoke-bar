export const SYSTEM_CATEGORIES = [
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
	"other",
] as const;

export type SystemCategory = (typeof SYSTEM_CATEGORIES)[number];

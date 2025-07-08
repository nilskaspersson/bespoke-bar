import type { SystemCategory } from "@/db/schema/categories";
import type { Measurement } from "@/db/schema/units";

export const MEASUREMENT_TO_LABEL = new Map<Measurement, string>([
	["mass", "Mass"],
	["pieces", "Pieces"],
	["volume", "Volume"],
]);

export const MEASUREMENT_TO_DESCRIPTION = new Map<Measurement, string>([
	[
		"mass",
		"For ingredients measured by weight, such as sugar, flour, or spices.",
	],
	[
		"pieces",
		"For ingredients measured by quantity, such as cherries, umbrellas, or straws.",
	],
	["volume", "For liquid ingredients, such as alcohol, water, juice, etc."],
]);

export const CATEGORY_TO_LABEL = new Map<SystemCategory, string>([
	["absinthe", "Absinthe"],
	["aquavit", "Aquavit"],
	["armagnac", "Armagnac"],
	["baijiu", "Baijiu"],
	["bourbon", "Bourbon"],
	["brandy", "Brandy"],
	["cachaca", "Cachaça"],
	["calvados", "Calvados"],
	["cognac", "Cognac"],
	["gin", "Gin"],
	["genever", "Genever"],
	["grappa", "Grappa"],
	["mezcal", "Mezcal"],
	["pisco", "Pisco"],
	["rum", "Rum"],
	["rye", "Rye"],
	["shochu", "Shochu"],
	["tequila", "Tequila"],
	["vodka", "Vodka"],
	["whiskey", "Whiskey"],
	["vermouth", "Vermouth"],
	["sherry", "Sherry"],
	["port", "Port"],
	["aperitif", "Aperitif"],
	["sake", "Sake"],
	["amaro", "Amaro"],
	["bitters", "Bitters"],
	["liqueur", "Liqueur"],
	["herbal_liqueur", "Herbal Liqueur"],
	["wine", "Wine"],
	["champagne", "Champagne"],
	["beer", "Beer"],
	["citrus", "Citrus"],
	["fruit", "Fruit"],
	["herb", "Herb"],
	["cocktail_bitters", "Cocktail Bitters"],
	["egg", "Egg"],
	["syrup", "Syrup"],
	["soda", "Soda"],
	["dairy", "Dairy"],
	["juice", "Juice"],
	["honey", "Honey"],
	["garnish", "Garnish"],
	["other", "Other"],
]);

export const MEASUREMENT_TO_DB_INGREDIENT_UNIT = new Map<Measurement, string>([
	["volume", "l"],
	["mass", "kg"],
	["pieces", "pc"],
]);

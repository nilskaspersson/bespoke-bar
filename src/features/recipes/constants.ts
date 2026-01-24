import type { CocktailStyle } from "@/db/schema/cocktailStyles";
import type { Glassware } from "@/db/schema/glassware";
import type { PreparationMethod } from "@/db/schema/preparationMethods";

export const DEFAULT_RECIPE_NAME = "Unnamed Recipe";

export const METHOD_TO_LABEL = new Map<PreparationMethod, string>([
	["stirred", "Stirred"],
	["shaken", "Shaken"],
	["built", "Built"],
	["blended", "Blended"],
	["layered", "Layered"],
]);

/**
 * Percentage of the final volume that is dilution.
 */
export const METHOD_TO_DEFAULT_DILUTION = new Map<PreparationMethod, number>([
	["stirred", 0.2],
	["shaken", 0.25],
	["built", 0.15],
	["blended", 0.3],
	["layered", 0],
]);

export const GLASSWARE_TO_LABEL = new Map<Glassware, string>([
	["coupe", "Coupe"],
	["fizz", "Fizz"],
	["flute", "Flute"],
	["highball", "Highball"],
	["hurricane", "Hurricane"],
	["julep", "Julep tin"],
	["martini", "Martini"],
	["nick_nora", "Nick & Nora"],
	["pilsner", "Pilsner"],
	["port", "Port"],
	["rocks_double", "Rocks (double)"],
	["rocks", "Rocks (single)"],
	["shot", "Shot glass"],
	["snifter", "Snifter"],
	["tiki_mug", "Tiki mug"],
	["wine", "Wine"],
]);

export const COCKTAIL_STYLE_TO_LABEL = new Map<CocktailStyle, string>([
	["aperitif", "Aperitif"],
	["cooler", "Cooler"],
	["digestif", "Digestif"],
	["fizz", "Fizz"],
	["flip", "Flip"],
	["highball", "Highball"],
	["julep", "Julep"],
	["martini", "Martini"],
	["oldFashioned", "Old Fashioned"],
	["other", "Other"],
	["punch", "Punch"],
	["smash", "Smash"],
	["sour", "Sour"],
	["spritz", "Spritz"],
	["tiki", "Tiki"],
]);

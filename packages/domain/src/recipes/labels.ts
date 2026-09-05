import type { CocktailStyle } from "@bespoke/schema/schema/cocktailStyles";
import type { Glassware } from "@bespoke/schema/schema/glassware";
import type { Ice } from "@bespoke/schema/schema/ice";
import type { PreparationMethod } from "@bespoke/schema/schema/preparationMethods";
import type { Recipe } from "@bespoke/schema/schema/recipes";

export const DEFAULT_RECIPE_NAME = "Unnamed Recipe";

export const METHOD_TO_LABEL = new Map<PreparationMethod, string>([
	["stirred", "Stirred"],
	["shaken", "Shaken"],
	["built", "Built"],
	["blended", "Blended"],
	["layered", "Layered"],
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

export const ICE_TO_LABEL = new Map<Ice, string>([
	["none", "No ice"],
	["cubed", "Ice cubes"],
	["crushed", "Crushed ice"],
]);

export const COCKTAIL_STYLE_TO_LABEL = new Map<CocktailStyle, string>([
	["aperitif", "Aperitif"],
	["cooler", "Cooler"],
	["digestif", "Digestif"],
	["fizz", "Fizz"],
	["flip", "Flip"],
	["highball", "Highball"],
	["julep", "Julep"],
	["manhattan", "Manhattan"],
	["martini", "Martini"],
	["negroni", "Negroni"],
	["oldFashioned", "Old Fashioned"],
	["other", "Other"],
	["punch", "Punch"],
	["smash", "Smash"],
	["sour", "Sour"],
	["spritz", "Spritz"],
	["tiki", "Tiki"],
]);

export type CocktailStyleFilter = CocktailStyle | null;

const UNCLASSIFIED_COCKTAIL_STYLE_LABEL = "Unclassified";

export function getCocktailStyleLabel(style: CocktailStyleFilter): string {
	return style
		? (COCKTAIL_STYLE_TO_LABEL.get(style) ?? style)
		: UNCLASSIFIED_COCKTAIL_STYLE_LABEL;
}

export function getRecipeName(recipe: Recipe) {
	return recipe.name || DEFAULT_RECIPE_NAME;
}

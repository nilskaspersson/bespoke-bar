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

export type CocktailStyleFilter = CocktailStyle | null;

export const UNCLASSIFIED_COCKTAIL_STYLE_LABEL = "Unclassified";
export const UNCLASSIFIED_COCKTAIL_STYLE_COLOR = "var(--mauve-8)";

/**
 * Per-style color tokens. Styles listed alphabetically; colors walk the
 * Radix `-11` palette in hue order for a pleasant gradient.
 */
export const COCKTAIL_STYLE_COLOR = new Map<CocktailStyle, string>([
	["aperitif", "var(--tomato-11)"],
	["cooler", "var(--red-11)"],
	["digestif", "var(--ruby-11)"],
	["fizz", "var(--crimson-11)"],
	["flip", "var(--pink-11)"],
	["highball", "var(--plum-11)"],
	["julep", "var(--violet-11)"],
	["martini", "var(--indigo-11)"],
	["oldFashioned", "var(--blue-11)"],
	["other", "var(--sky-11)"],
	["punch", "var(--cyan-11)"],
	["smash", "var(--mint-11)"],
	["sour", "var(--lime-11)"],
	["spritz", "var(--orange-11)"],
	["tiki", "var(--yellow-11)"],
]);

export function getCocktailStyleColor(style: CocktailStyleFilter): string {
	return style
		? (COCKTAIL_STYLE_COLOR.get(style) ?? UNCLASSIFIED_COCKTAIL_STYLE_COLOR)
		: UNCLASSIFIED_COCKTAIL_STYLE_COLOR;
}

export function getCocktailStyleLabel(style: CocktailStyleFilter): string {
	return style
		? (COCKTAIL_STYLE_TO_LABEL.get(style) ?? style)
		: UNCLASSIFIED_COCKTAIL_STYLE_LABEL;
}

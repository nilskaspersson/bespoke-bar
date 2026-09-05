import type { CocktailStyleFilter } from "@bespoke/domain/recipes/labels";
import type { CocktailStyle } from "@bespoke/schema/schema/cocktailStyles";
import type { PreparationMethod } from "@bespoke/schema/schema/preparationMethods";

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

const UNCLASSIFIED_COCKTAIL_STYLE_COLOR = "var(--mauve-8)";

/**
 * Per-style color tokens. Styles listed alphabetically; colors walk the
 * Radix `-11` palette in hue order for a pleasant gradient.
 */
const COCKTAIL_STYLE_COLOR = new Map<CocktailStyle, string>([
	["aperitif", "var(--tomato-11)"],
	["cooler", "var(--red-11)"],
	["digestif", "var(--ruby-11)"],
	["fizz", "var(--crimson-11)"],
	["flip", "var(--pink-11)"],
	["highball", "var(--plum-11)"],
	["julep", "var(--violet-11)"],
	["manhattan", "var(--bronze-11)"],
	["martini", "var(--indigo-11)"],
	["negroni", "var(--amber-11)"],
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

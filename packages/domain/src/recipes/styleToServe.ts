import type { CocktailStyle } from "@bespoke/schema/schema/cocktailStyles";
import type { BaseRecipe } from "@bespoke/schema/schema/recipes";

/** Default serve per major family — defaults the user can override. */
export const STYLE_TO_SERVE = new Map<
	CocktailStyle,
	Pick<BaseRecipe, "glassware" | "preparationMethod" | "ice">
>([
	["sour", { glassware: "coupe", preparationMethod: "shaken", ice: "none" }],
	["fizz", { glassware: "fizz", preparationMethod: "shaken", ice: "cubed" }],
	[
		"highball",
		{ glassware: "highball", preparationMethod: "built", ice: "cubed" },
	],
	[
		"martini",
		{ glassware: "martini", preparationMethod: "stirred", ice: "none" },
	],
	[
		"manhattan",
		{ glassware: "coupe", preparationMethod: "stirred", ice: "none" },
	],
	[
		"negroni",
		{ glassware: "rocks", preparationMethod: "stirred", ice: "cubed" },
	],
	[
		"oldFashioned",
		{ glassware: "rocks", preparationMethod: "built", ice: "cubed" },
	],
	["spritz", { glassware: "wine", preparationMethod: "built", ice: "cubed" }],
	[
		"smash",
		{ glassware: "rocks", preparationMethod: "shaken", ice: "crushed" },
	],
	["julep", { glassware: "julep", preparationMethod: "built", ice: "crushed" }],
	["flip", { glassware: "coupe", preparationMethod: "shaken", ice: "none" }],
	[
		"tiki",
		{ glassware: "tiki_mug", preparationMethod: "shaken", ice: "crushed" },
	],
	[
		"cooler",
		{ glassware: "highball", preparationMethod: "built", ice: "cubed" },
	],
]);

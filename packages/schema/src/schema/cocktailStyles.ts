export const COCKTAIL_STYLES = [
	"aperitif",
	"cooler",
	"digestif",
	"fizz",
	"flip",
	"highball",
	"julep",
	"manhattan",
	"martini",
	"negroni",
	"oldFashioned",
	"other",
	"punch",
	"smash",
	"sour",
	"spritz",
	"tiki",
] as const;

export type CocktailStyle = (typeof COCKTAIL_STYLES)[number];

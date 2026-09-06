import { z } from "zod";

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

export const cocktailStyles = z.enum(COCKTAIL_STYLES);

export type CocktailStyle = z.infer<typeof cocktailStyles>;

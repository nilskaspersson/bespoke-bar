import { pgEnum } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import type { z } from "zod/v4";

export const cocktailStylesEnum = pgEnum("cocktail_styles", [
	"aperitif",
	"cooler",
	"digestif",
	"fizz",
	"flip",
	"highball",
	"julep",
	"martini",
	"oldFashioned",
	"other",
	"punch",
	"smash",
	"sour",
	"spritz",
	"tiki",
]);

export const cocktailStyles = createSelectSchema(cocktailStylesEnum);

export type CocktailStyle = z.infer<typeof cocktailStyles>;

import { pgEnum } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import type { z } from "zod/v4";

export const glasswareEnum = pgEnum("glassware", [
	"coupe",
	"fizz",
	"flute",
	"highball",
	"hurricane",
	"julep",
	"martini",
	"nick_nora",
	"pilsner",
	"port",
	"rocks_double",
	"rocks",
	"shot",
	"snifter",
	"tiki_mug",
	"wine",
]);

export const glasswares = createSelectSchema(glasswareEnum);

export type Glassware = z.infer<typeof glasswares>;

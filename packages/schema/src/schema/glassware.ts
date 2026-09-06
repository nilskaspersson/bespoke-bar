import { z } from "zod";

export const GLASSWARES = [
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
] as const;

export const glasswares = z.enum(GLASSWARES);

export type Glassware = z.infer<typeof glasswares>;

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

export type Glassware = (typeof GLASSWARES)[number];

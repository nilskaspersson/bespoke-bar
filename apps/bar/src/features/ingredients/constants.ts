import type { Measurement } from "@bespoke/schema/schema/units";

export const MEASUREMENT_TO_LABEL = new Map<Measurement, string>([
	["mass", "Mass"],
	["pieces", "Pieces"],
	["volume", "Volume"],
]);

export const MEASUREMENT_TO_DESCRIPTION = new Map<Measurement, string>([
	[
		"mass",
		"For ingredients measured by weight, such as sugar, flour, or spices.",
	],
	[
		"pieces",
		"For ingredients measured by quantity, such as cherries, umbrellas, or straws.",
	],
	["volume", "For liquid ingredients, such as alcohol, water, juice, etc."],
]);

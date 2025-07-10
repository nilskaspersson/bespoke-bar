import type { PreparationMethod } from "@/db/schema/preparationMethods";

export const METHOD_TO_LABEL = new Map<PreparationMethod, string>([
	["stirred", "Stirred"],
	["shaken", "Shaken"],
	["built", "Built"],
	["blended", "Blended"],
	["layered", "Layered"],
]);

export const METHOD_TO_DESCRIPTION = new Map<PreparationMethod, string>([
	["stirred", "For cocktails like a martini or negroni"],
	["shaken", "For cocktails like a daiquiri or"],
	["built", "For cocktails like a long island iced tea"],
	["blended", "For cocktails like a margarita or mojito"],
	["layered", "For cocktails like a negroni"],
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

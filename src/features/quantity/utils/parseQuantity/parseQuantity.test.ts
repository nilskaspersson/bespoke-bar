import { describe, expect, test } from "vitest";
import { parseQuantity } from ".";

describe("parseQuantity", () => {
	test.each([
		// Basic decimal numbers
		["1", [1, ""]],
		["2.5", [2.5, ""]],
		["1.5", [1.5, ""]],
		["0.5", [0.5, ""]],
		[".5", [0.5, ""]],
		["10", [10, ""]],
		["123.456", [123.456, ""]],

		// Unicode fractions
		["½", [0.5, ""]],
		["¼", [0.25, ""]],
		["¾", [0.75, ""]],
		["⅓", [1 / 3, ""]],
		["⅔", [2 / 3, ""]],
		["⅛", [0.125, ""]],
		["⅜", [0.375, ""]],
		["⅝", [0.625, ""]],
		["⅞", [0.875, ""]],

		// Simple fractions (slash notation)
		["1/2", [0.5, ""]],
		["1/4", [0.25, ""]],
		["3/4", [0.75, ""]],
		["2/3", [2 / 3, ""]],
		["5/8", [0.625, ""]],

		// Fractions with spaces around slash
		["1 / 2", [0.5, ""]],
		["2 /3", [2 / 3, ""]],
		["3/ 4", [0.75, ""]],
		["1  /  2", [0.5, ""]],

		// With remainder
		["1 cl", [1, " cl"]],
		["2.5 ml", [2.5, " ml"]],
		["½ cup", [0.5, " cup"]],
		["1/2 tsp", [0.5, " tsp"]],

		// Leading/trailing whitespace
		["  1", [1, ""]],
		["1  ", [1, ""]],
		["  1.5  ", [1.5, ""]],
		["  ½", [0.5, ""]],
		["  1/2  ", [0.5, ""]],

		// No quantity cases
		["cl", [null, "cl"]],
		["", [null, ""]],
		["Licor 43", [null, "Licor 43"]],
	])('Parses "%s" as [%s]', (input, expected) => {
		expect(parseQuantity(input)).toEqual(expected);
	});
});

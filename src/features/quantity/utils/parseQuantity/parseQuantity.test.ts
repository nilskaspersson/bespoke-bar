import { describe, expect, test } from "vitest";
import { formatQuantity } from ".";

describe("formatQuantity", () => {
	test.each([
		// Basic decimal numbers
		["1", 1],
		["2.5", 2.5],
		["1.5", 1.5],
		["0.5", 0.5],
		[".5", 0.5],
		["10", 10],
		["123.45", 123.45],
		/**
		 * Handle locale-formatted quantities copied from any source: comma decimals and
		 * grouping separators both resolve. Since the source locale is unknown, roles are
		 * inferred from convention — a trailing run of exactly 3 digits reads as grouping
		 * (formatted quantities don't carry 3 decimal places); any other trailing length,
		 * or a leading-zero integer, reads as a decimal.
		 */
		["2,5", 2.5],
		["1,5", 1.5],
		["0,5", 0.5],
		[",5", 0.5],
		["4,5 cl Gin", 4.5],
		["0,125", 0.125],
		["1,500", 1500],
		["1,505", 1505],
		["12,345", 12345],
		["123.456", 123456],
		["1.500,5", 1500.5],
		["1,500.5", 1500.5],
		["12,345.6", 12345.6],
		["1.000.000", 1000000],
		["1,234,567", 1234567],

		// Unicode fractions
		["½", 0.5],
		["¼", 0.25],
		["¾", 0.75],
		["⅓", 1 / 3],
		["⅔", 2 / 3],
		["⅛", 0.125],
		["⅜", 0.375],
		["⅝", 0.625],
		["⅞", 0.875],

		// Rare precomposed fractions (gained via NFKC decomposition)
		["⅕", 0.2],
		["⅖", 0.4],
		["⅗", 0.6],
		["⅘", 0.8],
		["⅙", 1 / 6],
		["⅚", 5 / 6],

		// U+2044 fraction slash (common in pasted recipes)
		["1⁄2", 0.5],
		["1⁄4", 0.25],
		["3 1⁄3", 3 + 1 / 3],
		["1⁄2 oz Fresh Lime Juice", 0.5],

		// Simple fractions (slash notation)
		["1/2", 0.5],
		["1/4", 0.25],
		["3/4", 0.75],
		["2/3", 2 / 3],
		["5/8", 0.625],

		// Fractions with spaces around slash
		["1 / 2", 0.5],
		["2 /3", 2 / 3],
		["3/ 4", 0.75],
		["1  /  2", 0.5],

		// Mixed numbers (whole + fraction)
		["1 3/4", 1.75],
		["2 1/2", 2.5],
		["1 ½", 1.5],
		["3¼", 3.25],
		["101/2", 10.5],
		["12 ¾", 12.75],
		["1 3/4 fl-oz", 1.75],

		// With remainder
		["1 cl", 1],
		["2.5 ml", 2.5],
		["½ cup", 0.5],
		["1/2 tsp", 0.5],

		// Leading/trailing whitespace
		["  1", 1],
		["1  ", 1],
		["  1.5  ", 1.5],
		["  ½", 0.5],
		["  1/2  ", 0.5],

		// No quantity cases
		["cl", null],
		["", null],
		["Licor 43", null],
	])('Parses "%s" as [%s]', (input, expected) => {
		expect(formatQuantity(input)).toEqual(expected);
	});
});

import { describe, expect, test } from "vitest";
import { supportedUnits } from "@/db/schema/units";
import { userInputToSpec } from ".";

describe("userInputToSpec", () => {
	describe("parses unit", () => {
		test.each(supportedUnits.options)('"%s"', (unit) => {
			expect(userInputToSpec(`1 ${unit} gin`)).toEqual({
				quantity: 1,
				unit,
				ingredient: "Gin",
			});
		});
	});

	describe("parses unit (uppercase)", () => {
		test.each(supportedUnits.options.map((unit) => unit.toUpperCase()))(
			'"%s"',
			(unit) => {
				expect(userInputToSpec(`1 ${unit} gin`)).toEqual({
					quantity: 1,
					unit: unit.toLowerCase(),
					ingredient: "Gin",
				});
			},
		);
	});

	describe("parses common unit deviations", () => {
		test.each([
			[
				"5cl tanqueray Gin",
				{ quantity: 5, unit: "cl", ingredient: "Tanqueray Gin" },
			],
			["2 _ml Suze", { quantity: 2, unit: "ml", ingredient: "Suze" }],
			[
				"3   fl-oz   Lemon  juice ",
				{ quantity: 3, unit: "fl_oz", ingredient: "Lemon juice" },
			],
		])('"%s"', (input, expected) => {
			expect(userInputToSpec(input)).toEqual(expected);
		});
	});
});

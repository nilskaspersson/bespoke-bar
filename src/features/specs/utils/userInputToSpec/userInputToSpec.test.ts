import { describe, expect, test } from "vitest";
import { supportedUnits } from "@/db/schema/units";
import { MOCK_INGREDIENTS } from "@/mocks/data/ingredients";
import { userInputToSpec } from ".";

describe("userInputToSpec", () => {
	describe("parses unit", () => {
		test.each(supportedUnits.options)('"%s"', (unit) => {
			expect(userInputToSpec(`1 ${unit} gin`, MOCK_INGREDIENTS)).toEqual({
				quantity: 1,
				unit,
				ingredient: { name: "Gin" },
				ingredientId: undefined,
			});
		});
	});

	describe("parses unit (uppercase)", () => {
		test.each(supportedUnits.options.map((unit) => unit.toUpperCase()))(
			'"%s"',
			(unit) => {
				expect(userInputToSpec(`1 ${unit} gin`, MOCK_INGREDIENTS)).toEqual({
					quantity: 1,
					unit: unit.toLowerCase(),
					ingredient: { name: "Gin" },
					ingredientId: undefined,
				});
			},
		);
	});

	describe("parses common unit deviations", () => {
		test.each([
			[
				"5cl tanqueray Gin",
				{
					quantity: 5,
					unit: "cl",
					ingredient: { name: "Tanqueray Gin" },
					ingredientId: undefined,
				},
			],
			[
				"2 _ml Suze",
				{
					quantity: 2,
					unit: "ml",
					ingredient: { name: "Suze" },
					ingredientId: undefined,
				},
			],
			[
				"3   fl-oz   Lemon  juice ",
				{
					quantity: 3,
					unit: "fl_oz",
					ingredient: { name: "Lemon juice" },
					ingredientId: undefined,
				},
			],
		])('"%s"', (input, expected) => {
			expect(userInputToSpec(input, MOCK_INGREDIENTS)).toEqual(expected);
		});
	});
});

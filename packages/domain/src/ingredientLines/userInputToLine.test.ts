import type { Ingredient } from "@bespoke/schema/schema/ingredients";
import { supportedUnits } from "@bespoke/schema/schema/units";
import { describe, expect, test } from "vitest";
import { MOCK_INGREDIENTS } from "../mocks/ingredients";
import { userInputToLine } from "./userInputToLine";

const EMPTY_INGREDIENT: Partial<Ingredient> = {
	name: "",
	category: null,
	abv: null,
	brand: null,
	measurementType: null,
	unitCost: null,
};

describe("userInputToLine", () => {
	describe("parses unit", () => {
		test.each(supportedUnits.options)('"%s"', (unit) => {
			expect(userInputToLine(`1 ${unit} gin`, MOCK_INGREDIENTS)).toEqual({
				quantity: 1,
				unit,
				ingredient: {
					...EMPTY_INGREDIENT,
					name: "gin",
					abv: 0.4,
					category: "gin",
					measurementType: "volume",
				},
				ingredientId: undefined,
			});
		});
	});

	describe("parses unit (uppercase)", () => {
		test.each(
			supportedUnits.options.map((unit) => unit.toUpperCase()),
		)('"%s"', (unit) => {
			expect(userInputToLine(`1 ${unit} gin`, MOCK_INGREDIENTS)).toEqual({
				quantity: 1,
				unit: unit.toLowerCase(),

				ingredient: {
					...EMPTY_INGREDIENT,
					name: "gin",
					abv: 0.4,
					category: "gin",
					measurementType: "volume",
				},
				ingredientId: undefined,
			});
		});
	});

	describe("parses common unit deviations", () => {
		test.each([
			[
				"5cl Tanqueray Gin",
				{
					quantity: 5,
					unit: "cl",
					ingredient: {
						...EMPTY_INGREDIENT,
						name: "Tanqueray Gin",
						category: "gin",
						abv: 0.4,
						measurementType: "volume",
					},
					ingredientId: undefined,
				},
			],
			[
				"2 _ml Suze",
				{
					quantity: 2,
					unit: null,
					ingredient: {
						...EMPTY_INGREDIENT,
						name: "_ml Suze",
						measurementType: null,
					},
					ingredientId: undefined,
				},
			],
			[
				"3   fl-oz   Lemon  juice ",
				{
					quantity: 3,
					unit: "fl_oz",
					ingredient: {
						...EMPTY_INGREDIENT,
						name: "Lemon juice",
						category: "citrus",
						measurementType: "volume",
					},
					ingredientId: undefined,
				},
			],
		])('"%s"', (input, expected) => {
			expect(userInputToLine(input, MOCK_INGREDIENTS)).toEqual(expected);
		});
	});
});

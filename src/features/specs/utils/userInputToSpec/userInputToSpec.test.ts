import { describe, expect, test } from "vitest";
import type { Ingredient } from "@/db/schema/ingredients";
import { supportedUnits } from "@/db/schema/units";
import { MOCK_INGREDIENTS } from "@/mocks/data/ingredients";
import { userInputToSpec } from ".";

const EMPTY_INGREDIENT: Partial<Ingredient> = {
	name: "",
	category: null,
	abv: null,
	brand: null,
	measurementType: null,
	price: null,
};

describe("userInputToSpec", () => {
	describe("parses unit", () => {
		test.each(supportedUnits.options)('"%s"', (unit) => {
			expect(userInputToSpec(`1 ${unit} gin`, MOCK_INGREDIENTS)).toEqual({
				quantity: 1,
				unit,
				ingredient: {
					...EMPTY_INGREDIENT,
					name: "Gin",
					abv: 0.4,
					category: "gin",
					measurementType: "volume",
				},
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

					ingredient: {
						...EMPTY_INGREDIENT,
						name: "Gin",
						abv: 0.4,
						category: "gin",
						measurementType: "volume",
					},
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
					unit: "ml",
					ingredient: {
						...EMPTY_INGREDIENT,
						name: "Suze",
						measurementType: "volume",
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
			expect(userInputToSpec(input, MOCK_INGREDIENTS)).toEqual(expected);
		});
	});
});

import type { Ingredient } from "@bespoke/schema/schema/ingredients";
import { describe, expect, test } from "vitest";
import { MOCK_INGREDIENTS } from "../mocks/ingredients";
import { withoutKey } from "../utils/withKey";
import { userInputToBulkRecipe } from "./userInputToBulkRecipe";

const EMPTY_INGREDIENT: Partial<Ingredient> = {
	name: "",
	category: null,
	abv: null,
	brand: null,
	measurementType: null,
	unitCost: null,
};

const USER_INPUT = `
Recipe 1
 1 cl Gin
2 l Suze

  Summer evenings 😍
        5 cl Gin
30 ml lime juice
2   cucumber slices


- 1oz milk
-1cl cinnamon syrup

Gimlet
*5cl gin
* 3cl lime
* 2cl simple syrup

kall
4.5 ml whiskey


  `;

describe("userInputToBulkRecipe", () => {
	test("parses a wide range of input", () => {
		const data = userInputToBulkRecipe(USER_INPUT, MOCK_INGREDIENTS).map(
			(o) => ({
				...o,
				lines: o.lines?.map(withoutKey),
			}),
		);

		const LIME = MOCK_INGREDIENTS.find((o) => o.name.toLowerCase() === "lime");
		const SIMPLE_SYRUP = MOCK_INGREDIENTS.find(
			(o) => o.name.toLowerCase() === "simple syrup",
		);

		expect(data).toEqual([
			{
				name: "Recipe 1",
				lines: [
					{
						quantity: 1,
						unit: "cl",
						ingredient: {
							...EMPTY_INGREDIENT,
							name: "Gin",
							measurementType: "volume",
							category: "gin",
							abv: 0.4,
						},
						ingredientId: undefined,
					},
					{
						quantity: 2,
						unit: "l",
						ingredient: {
							...EMPTY_INGREDIENT,
							name: "Suze",
							measurementType: "volume",
						},
						ingredientId: undefined,
					},
				],
			},
			{
				name: "Summer evenings 😍",
				lines: [
					{
						quantity: 5,
						unit: "cl",
						ingredient: {
							...EMPTY_INGREDIENT,
							name: "Gin",
							category: "gin",
							abv: 0.4,
							measurementType: "volume",
						},
						ingredientId: undefined,
					},
					{
						quantity: 30,
						unit: "ml",
						ingredient: {
							...EMPTY_INGREDIENT,
							name: "lime juice",
							category: "citrus",
							measurementType: "volume",
						},
						ingredientId: undefined,
					},
					{
						quantity: 2,
						unit: null,
						ingredient: { ...EMPTY_INGREDIENT, name: "cucumber slices" },
						ingredientId: undefined,
					},
				],
			},
			{
				name: null,
				lines: [
					{
						quantity: 1,
						unit: "fl_oz",
						ingredient: {
							...EMPTY_INGREDIENT,
							name: "milk",
							measurementType: "volume",
							category: "dairy",
						},
						ingredientId: undefined,
					},
					{
						quantity: 1,
						unit: "cl",
						ingredient: {
							...EMPTY_INGREDIENT,
							name: "cinnamon syrup",
							measurementType: "volume",
							category: "syrup",
						},
						ingredientId: undefined,
					},
				],
			},
			{
				name: "Gimlet",
				lines: [
					{
						quantity: 5,
						unit: "cl",
						ingredient: {
							...EMPTY_INGREDIENT,
							name: "gin",
							measurementType: "volume",
							category: "gin",
							abv: 0.4,
						},
						ingredientId: undefined,
					},
					{
						quantity: 3,
						unit: "cl",
						ingredient: LIME,
						ingredientId: LIME?.id,
					},
					{
						quantity: 2,
						unit: "cl",
						ingredient: SIMPLE_SYRUP,
						ingredientId: SIMPLE_SYRUP?.id,
					},
				],
			},
			{
				name: "kall",
				lines: [
					{
						quantity: 4.5,
						unit: "ml",
						ingredient: {
							...EMPTY_INGREDIENT,
							name: "whiskey",
							category: "whiskey",
							measurementType: "volume",
							abv: 0.4,
						},
						ingredientId: undefined,
					},
				],
			},
		]);
	});

	test.each([
		// Space-grouped quantity, multi-word name preserved verbatim
		["1 500 ml Crème de Cassis", 1500, "ml", "Crème de Cassis"],
		["1 234 567 ml Water", 1234567, "ml", "Water"],
		["12 345 cl Cold Brew", 12345, "cl", "Cold Brew"],
		// Comma decimal and dot/comma grouping
		["4,5 cl Gin", 4.5, "cl", "Gin"],
		["1.500,5 ml Batch base", 1500.5, "ml", "Batch base"],
		// A comma inside the ingredient name is left untouched
		["30 ml Salt, to taste", 30, "ml", "Salt, to taste"],
		// Non-grouping spaces stay delimiters; name intact
		["2 cucumber slices", 2, null, "cucumber slices"],
		["1 3/4 oz Rye Whiskey", 1.75, "fl_oz", "Rye Whiskey"],
		// Number-led name with no quantity collapses (accepted collision), name intact
		["1 800 Tequila", 1800, null, "Tequila"],
	])("keeps the ingredient name intact: %s", (input, quantity, unit, name) => {
		const [recipe] = userInputToBulkRecipe(input, []);
		const [line] = recipe.lines ?? [];

		expect(line?.quantity).toBe(quantity);
		expect(line?.unit).toBe(unit);
		expect(line?.ingredient.name).toBe(name);
	});
});

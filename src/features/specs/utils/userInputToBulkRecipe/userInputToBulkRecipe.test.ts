import { describe, expect, test } from "vitest";
import type { Ingredient } from "@/db/schema/ingredients";
import { MOCK_INGREDIENTS } from "@/mocks/data/ingredients";
import { withoutKey } from "@/utils/withKey";
import { userInputToBulkRecipe } from ".";

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
				specs: o.specs?.map(withoutKey),
			}),
		);

		const LIME = MOCK_INGREDIENTS.find((o) => o.name.toLowerCase() === "lime");
		const SIMPLE_SYRUP = MOCK_INGREDIENTS.find(
			(o) => o.name.toLowerCase() === "simple syrup",
		);

		expect(data).toEqual([
			{
				name: "Recipe 1",
				specs: [
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
				specs: [
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
				specs: [
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
				specs: [
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
				specs: [
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
});

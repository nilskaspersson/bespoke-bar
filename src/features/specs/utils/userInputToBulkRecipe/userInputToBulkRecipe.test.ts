import { describe, expect, test } from "vitest";
import { withoutKey } from "@/utils/withKey";
import { userInputToBulkRecipe } from ".";

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
		const data = userInputToBulkRecipe(USER_INPUT).map((o) => ({
			...o,
			specs: o.specs?.map(withoutKey),
		}));

		expect(data).toEqual([
			{
				name: "Recipe 1",
				specs: [
					{ quantity: 1, unit: "cl", ingredient: "Gin" },
					{ quantity: 2, unit: "l", ingredient: "Suze" },
				],
			},
			{
				name: "Summer evenings 😍",
				specs: [
					{ quantity: 5, unit: "cl", ingredient: "Gin" },
					{ quantity: 30, unit: "ml", ingredient: "Lime juice" },
					{ quantity: 2, unit: null, ingredient: "Cucumber slices" },
				],
			},
			{
				name: null,
				specs: [
					{ quantity: 1, unit: "fl_oz", ingredient: "Milk" },
					{ quantity: 1, unit: "cl", ingredient: "Cinnamon syrup" },
				],
			},
			{
				name: "Gimlet",
				specs: [
					{ quantity: 5, unit: "cl", ingredient: "Gin" },
					{ quantity: 3, unit: "cl", ingredient: "Lime" },
					{ quantity: 2, unit: "cl", ingredient: "Simple syrup" },
				],
			},
			{
				name: "kall",
				specs: [{ quantity: 4.5, unit: "ml", ingredient: "Whiskey" }],
			},
		]);
	});
});

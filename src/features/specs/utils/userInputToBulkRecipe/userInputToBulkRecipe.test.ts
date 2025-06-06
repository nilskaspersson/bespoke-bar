import { describe, expect, test } from "vitest";
import { userInputToBulkRecipe } from ".";

const USER_INPUT = `
Recipe 1
 1 cl Gin
2 l Suze

Summer evenings 😍
        5 cl Gin
30 ml lime juice
2   cucumber slices

😋

1oz milk
1cl cinnamon syrup

.
`;

describe("userInputToBulkRecipe", () => {
	test("parses a wide range of input", () => {
		expect(userInputToBulkRecipe(USER_INPUT)).toEqual([
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
		]);
	});
});

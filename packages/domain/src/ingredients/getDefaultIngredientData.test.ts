import { describe, expect, test } from "vitest";
import { getDefaultIngredientData } from "./getDefaultIngredientData";

describe("getDefaultIngredientData", () => {
	test("finds a measurement type for a given ingredient", () => {
		const ingredient = getDefaultIngredientData("vodka", "cl");
		expect(ingredient.measurementType).toBe("volume");
	});
});

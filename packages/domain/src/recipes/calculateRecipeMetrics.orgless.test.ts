import { describe, expect, it } from "vitest";
import { userInputToBulkRecipe } from "../ingredientLines/userInputToBulkRecipe";
import { calculateRecipeMetrics } from "./calculateRecipeMetrics";
import { getRecipeCost } from "./getRecipeCost";

/**
 * The Recipe Calculator (a Public Tool on the Lounge) runs with no
 * Organisation, so it parses against an empty ingredient library. ABV must
 * still resolve, via `getDefaultIngredientData` seeding `CATEGORY_DEFAULT_ABV`
 * from the typed name. Cost must stay unavailable — there is no `unitCost`.
 */
describe("metrics with no ingredient library", () => {
	it("derives ABV from the ingredient name alone", () => {
		const [recipe] = userInputToBulkRecipe(
			"Negroni\n3 cl gin\n3 cl campari\n3 cl sweet vermouth",
			[],
		);

		const metrics = calculateRecipeMetrics(recipe);

		expect(metrics.abv).toBeGreaterThan(0);
	});

	it("leaves cost uncomputable", () => {
		const [recipe] = userInputToBulkRecipe("Gimlet\n5 cl gin", []);

		expect(getRecipeCost(recipe)).toEqual({ cost: 0, isIncomplete: true });
	});
});

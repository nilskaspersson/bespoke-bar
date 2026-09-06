import type { BaseRecipe } from "@bespoke/schema/schema/recipes";
import { describe, expect, it } from "vitest";
import { calculateRecipeMetrics } from "./calculateRecipeMetrics";

function recipeAt(dilutionTarget: number): BaseRecipe {
	return {
		dilutionTarget,
		lines: [
			{
				id: "1",
				quantity: 100,
				unit: "ml",
				ingredient: {
					abv: 0.4,
					measurementType: "volume",
				},
			},
		],
	};
}

describe("dilution target", () => {
	it("adds water as a share of the undiluted volume", () => {
		const metrics = calculateRecipeMetrics(recipeAt(0.25));

		expect(metrics.originalVolume).toBeCloseTo(100);
		expect(metrics.dilutionVolume).toBeCloseTo(25);
		expect(metrics.finalVolume).toBeCloseTo(125);
	});

	it("reports the same dilution against the final volume", () => {
		const metrics = calculateRecipeMetrics(recipeAt(0.25));

		expect(metrics.dilutionOfOriginalVolume).toBeCloseTo(0.25);
		expect(metrics.dilutionOfFinalVolume).toBeCloseTo(0.2);
	});

	it("doubles the volume at 100%", () => {
		const metrics = calculateRecipeMetrics(recipeAt(1));

		expect(metrics.dilutionVolume).toBeCloseTo(100);
		expect(metrics.finalVolume).toBeCloseTo(200);
	});

	it("keeps a julep past 100% rather than falling back to neat", () => {
		const metrics = calculateRecipeMetrics(recipeAt(1.5));

		expect(metrics.finalVolume).toBeCloseTo(250);
	});

	it("dilutes the ABV, leaving the undiluted one alone", () => {
		const metrics = calculateRecipeMetrics(recipeAt(0.25));

		expect(metrics.abv).toBeCloseTo(0.32);
		expect(metrics.undilutedAbv).toBeCloseTo(0.4);
	});

	it("serves an undiluted recipe neat", () => {
		const metrics = calculateRecipeMetrics(recipeAt(0));

		expect(metrics.dilutionVolume).toBe(0);
		expect(metrics.finalVolume).toBeCloseTo(100);
		expect(metrics.abv).toBeCloseTo(0.4);
	});
});

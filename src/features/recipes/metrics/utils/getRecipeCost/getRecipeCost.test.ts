import { describe, expect, it } from "vitest";
import type { BaseRecipe } from "@/db/schema/recipes";
import type { Unit } from "@/db/schema/units";
import { getRecipeCost } from ".";

describe("getRecipeCost", () => {
	describe("successful calculations", () => {
		it("should calculate cost for single volume ingredient", () => {
			const recipe: BaseRecipe = {
				specs: [
					{
						id: "1",
						quantity: 50,
						unit: "ml",
						ingredient: {
							unitCost: 30,
							measurementType: "volume",
						},
					},
				],
			};

			const result = getRecipeCost(recipe);

			expect(result.cost).toBeCloseTo(1.5);
			expect(result.isIncomplete).toBe(false);
		});

		it("should calculate cost for multiple volume ingredients", () => {
			const recipe: BaseRecipe = {
				specs: [
					{
						id: "1",
						quantity: 60,
						unit: "ml",
						ingredient: {
							unitCost: 35,
							measurementType: "volume",
						},
					},
					{
						id: "2",
						quantity: 10,
						unit: "ml",
						ingredient: {
							unitCost: 18,
							measurementType: "volume",
						},
					},
				],
			};

			const result = getRecipeCost(recipe);

			expect(result.cost).toBeCloseTo(2.28);
			expect(result.isIncomplete).toBe(false);
		});

		it("should handle different volume units", () => {
			const recipe: BaseRecipe = {
				specs: [
					{
						id: "1",
						quantity: 2,
						unit: "fl_oz",
						ingredient: {
							unitCost: 35,
							measurementType: "volume",
						},
					},
				],
			};

			const result = getRecipeCost(recipe);

			expect(result.cost).toBeCloseTo(2.07, 1);
			expect(result.isIncomplete).toBe(false);
		});

		it("should return zero cost for empty specs", () => {
			const recipe: BaseRecipe = { specs: [] };
			const result = getRecipeCost(recipe);

			expect(result.cost).toBe(0);
			expect(result.isIncomplete).toBe(false);
		});
	});

	describe("incomplete data handling", () => {
		it("should mark as incomplete when unitCost is missing", () => {
			const recipe: BaseRecipe = {
				specs: [
					{
						id: "1",
						quantity: 50,
						unit: "ml",
						ingredient: {
							unitCost: null,
							measurementType: "volume",
						},
					},
				],
			};

			const result = getRecipeCost(recipe);

			expect(result.cost).toBe(0);
			expect(result.isIncomplete).toBe(true);
		});

		it("should mark as incomplete when unit is missing", () => {
			const recipe: BaseRecipe = {
				specs: [
					{
						id: "1",
						quantity: 50,
						unit: null,
						ingredient: {
							unitCost: 25,
							measurementType: "volume",
						},
					},
				],
			};

			const result = getRecipeCost(recipe);

			expect(result.cost).toBe(0);
			expect(result.isIncomplete).toBe(true);
		});

		it("should calculate partial cost when some specs are incomplete", () => {
			const recipe: BaseRecipe = {
				specs: [
					{
						id: "1",
						quantity: 50,
						unit: "ml",
						ingredient: {
							unitCost: 30,
							measurementType: "volume",
						},
					},
					{
						id: "2",
						quantity: 30,
						unit: "ml",
						ingredient: {
							unitCost: null,
							measurementType: "volume",
						},
					},
				],
			};

			const result = getRecipeCost(recipe);

			expect(result.cost).toBeCloseTo(1.5);
			expect(result.isIncomplete).toBe(true);
		});
	});

	describe("measurement type handling", () => {
		it("should handle null measurementType", () => {
			const recipe: BaseRecipe = {
				specs: [
					{
						id: "1",
						quantity: 50,
						unit: "ml",
						ingredient: {
							unitCost: 25,
							measurementType: null,
						},
					},
				],
			};

			const result = getRecipeCost(recipe);

			expect(result.cost).toBe(0);
			expect(result.isIncomplete).toBe(false);
		});
	});

	describe("edge cases", () => {
		it("should handle zero quantities", () => {
			const recipe: BaseRecipe = {
				specs: [
					{
						id: "1",
						quantity: 0,
						unit: "ml",
						ingredient: {
							unitCost: 30,
							measurementType: "volume",
						},
					},
				],
			};

			const result = getRecipeCost(recipe);

			expect(result.cost).toBe(0);
			expect(result.isIncomplete).toBe(false);
		});

		it("should handle zero unit costs", () => {
			const recipe: BaseRecipe = {
				specs: [
					{
						id: "1",
						quantity: 50,
						unit: "ml",
						ingredient: {
							unitCost: 0,
							measurementType: "volume",
						},
					},
				],
			};

			const result = getRecipeCost(recipe);

			expect(result.cost).toBe(0);
			expect(result.isIncomplete).toBe(false);
		});

		it("should handle undefined specs", () => {
			const recipe: BaseRecipe = { specs: undefined };
			const result = getRecipeCost(recipe);

			expect(result.cost).toBe(0);
			expect(result.isIncomplete).toBe(false);
		});

		it("should handle conversion errors gracefully", () => {
			const recipe: BaseRecipe = {
				specs: [
					{
						id: "1",
						quantity: 50,
						unit: "INVALID_UNIT" as Unit,
						ingredient: {
							unitCost: 30,
							measurementType: "volume",
						},
					},
				],
			};

			const result = getRecipeCost(recipe);

			expect(result.cost).toBe(0);
			expect(result.isIncomplete).toBe(true);
		});
	});
});

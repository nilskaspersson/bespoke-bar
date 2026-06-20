import { describe, expect, it } from "vitest";
import type { Unit } from "@/db/schema/units";
import { quantityToBestUnit } from ".";

describe("quantityToBestUnit", () => {
	it("should return null for null quantity", () => {
		expect(
			quantityToBestUnit({
				quantity: null,
				unit: "ml",
				unitSystem: "metric",
			}),
		).toBeNull();
	});

	it("should return null for undefined quantity", () => {
		expect(
			quantityToBestUnit({
				quantity: undefined,
				unit: "ml",
				unitSystem: "metric",
			}),
		).toBeNull();
	});

	it("should return null when unit is null", () => {
		expect(
			quantityToBestUnit({
				quantity: 5,
				unit: null,
				unitSystem: "metric",
			}),
		).toBeNull();
	});

	it("should return quantity with unit when unit is not in mapping", () => {
		expect(
			quantityToBestUnit({
				quantity: 5,
				unit: "INVALID_UNIT" as Unit,
				unitSystem: "metric",
			}),
		).toEqual([5, "INVALID_UNIT"]);
	});

	it("should preserve bartending units for small quantities", () => {
		expect(
			quantityToBestUnit({
				quantity: 2,
				unit: "dash",
				unitSystem: "metric",
			}),
		).toEqual([2, "dash"]);
	});

	it("should convert regular units to best volume format", () => {
		expect(
			quantityToBestUnit({
				quantity: 250,
				unit: "ml",
				unitSystem: "metric",
			}),
		).toEqual([2.5, "dl"]);
	});

	it("should multiply quantity by servings", () => {
		expect(
			quantityToBestUnit({
				quantity: 2,
				unit: "dash",
				unitSystem: "metric",
				servings: 3,
			}),
		).toEqual([6, "dash"]);
	});

	it("should handle imperial unit system", () => {
		const result = quantityToBestUnit({
			quantity: 100,
			unit: "ml",
			unitSystem: "imperial",
		});

		expect(result).toEqual(
			expect.arrayContaining([expect.closeTo(3.38, 1), "fl_oz"]),
		);
	});

	it("should default servings to 1 when not provided", () => {
		expect(
			quantityToBestUnit({
				quantity: 50,
				unit: "ml",
				unitSystem: "metric",
			}),
		).toEqual([5, "cl"]);
	});
});

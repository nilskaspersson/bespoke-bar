import { describe, expect, it } from "vitest";
import type { Unit } from "@/db/schema/units";
import { roundUnit } from "@/features/units/hooks/useRoundedUnit";
import type { UnitSystems } from "@/features/units/utils/convert";
import { createVolumeFormatter } from "@/utils/formatting";
import { quantityToBestUnit } from ".";

const volumeFormatter = createVolumeFormatter("en-GB");

const testRoundUnit = (
	volumeInMl: number,
	unitSystem: UnitSystems | null | undefined,
) => roundUnit(volumeInMl, unitSystem, volumeFormatter);

describe("quantityToBestUnit", () => {
	it("should return empty string for null quantity", () => {
		expect(
			quantityToBestUnit({
				quantity: null,
				unit: "ml",
				unitSystem: "metric",
				roundUnit: testRoundUnit,
			}),
		).toBe("");
	});

	it("should return empty string for undefined quantity", () => {
		expect(
			quantityToBestUnit({
				quantity: undefined,
				unit: "ml",
				unitSystem: "metric",
				roundUnit: testRoundUnit,
			}),
		).toBe("");
	});

	it("should return quantity as string when unit is null", () => {
		expect(
			quantityToBestUnit({
				quantity: 5,
				unit: null,
				unitSystem: "metric",
				roundUnit: testRoundUnit,
			}),
		).toBe("5");
	});

	it("should return quantity as string when unit is not in mapping", () => {
		expect(
			quantityToBestUnit({
				quantity: 5,
				unit: "INVALID_UNIT" as Unit,
				unitSystem: "metric",
				roundUnit: testRoundUnit,
			}),
		).toBe("5");
	});

	it("should preserve bartending units for small quantities", () => {
		expect(
			quantityToBestUnit({
				quantity: 2,
				unit: "dash",
				unitSystem: "metric",
				roundUnit: testRoundUnit,
			}),
		).toBe("2 dashes");
	});

	it("should convert regular units to best volume format", () => {
		expect(
			quantityToBestUnit({
				quantity: 250,
				unit: "ml",
				unitSystem: "metric",
				roundUnit: testRoundUnit,
			}),
		).toBe("2.5 dl");
	});

	it("should multiply quantity by servings", () => {
		expect(
			quantityToBestUnit({
				quantity: 2,
				unit: "dash",
				unitSystem: "metric",
				servings: 3,
				roundUnit: testRoundUnit,
			}),
		).toBe("6 dashes");
	});

	it("should handle imperial unit system", () => {
		expect(
			quantityToBestUnit({
				quantity: 100,
				unit: "ml",
				unitSystem: "imperial",
				roundUnit: testRoundUnit,
			}),
		).toBe("3.38 fl oz");
	});

	it("should default servings to 1 when not provided", () => {
		expect(
			quantityToBestUnit({
				quantity: 50,
				unit: "ml",
				unitSystem: "metric",
				roundUnit: testRoundUnit,
			}),
		).toBe("5 cl");
	});
});

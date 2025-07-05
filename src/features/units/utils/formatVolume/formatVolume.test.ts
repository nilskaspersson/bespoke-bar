import { describe, expect, it } from "vitest";
import type { Unit } from "@/db/schema/units";
import { formatVolume, quantityToBestUnit } from ".";

describe("formatVolume", () => {
	it("should return '0 ml' for zero volume with metric system", () => {
		expect(formatVolume(0, "metric")).toBe("0 ml");
	});

	it("should return '0 fl oz' for zero volume with imperial system", () => {
		expect(formatVolume(0, "imperial")).toBe("0 fl oz");
	});

	it("should format large imperial volumes as gallons", () => {
		expect(formatVolume(15000, "imperial")).toBe("3.96 Gallons");
	});

	it("should format medium imperial volumes as cups", () => {
		expect(formatVolume(300, "imperial")).toBe("1.27 Cups");
	});

	it("should format small imperial volumes as fl oz", () => {
		expect(formatVolume(100, "imperial")).toBe("3.38 fl oz");
	});

	it("should format large metric volumes as liters", () => {
		expect(formatVolume(1500, "metric")).toBe("1.5 Litres");
	});

	it("should format medium metric volumes as deciliters", () => {
		expect(formatVolume(250, "metric")).toBe("2.5 dl");
	});

	it("should format small metric volumes as centiliters", () => {
		expect(formatVolume(50, "metric")).toBe("5 cl");
	});

	it("should format very small metric volumes as ml", () => {
		expect(formatVolume(5, "metric")).toBe("5 ml");
	});

	it("should default to metric formatting when unitSystem is null", () => {
		expect(formatVolume(100, null)).toBe("10 cl");
	});
});

describe("quantityToBestUnit", () => {
	it("should return empty string for null quantity", () => {
		expect(
			quantityToBestUnit({
				quantity: null,
				unit: "ml",
				unitSystem: "metric",
			}),
		).toBe("");
	});

	it("should return empty string for undefined quantity", () => {
		expect(
			quantityToBestUnit({
				quantity: undefined,
				unit: "ml",
				unitSystem: "metric",
			}),
		).toBe("");
	});

	it("should return quantity as string when unit is null", () => {
		expect(
			quantityToBestUnit({
				quantity: 5,
				unit: null,
				unitSystem: "metric",
			}),
		).toBe("5");
	});

	it("should return quantity as string when unit is not in mapping", () => {
		expect(
			quantityToBestUnit({
				quantity: 5,
				unit: "INVALID_UNIT" as Unit,
				unitSystem: "metric",
			}),
		).toBe("5");
	});

	it("should preserve bartending units for small quantities", () => {
		expect(
			quantityToBestUnit({
				quantity: 2,
				unit: "dash",
				unitSystem: "metric",
			}),
		).toBe("2 dashes");
	});

	it("should convert regular units to best volume format", () => {
		expect(
			quantityToBestUnit({
				quantity: 250,
				unit: "ml",
				unitSystem: "metric",
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
			}),
		).toBe("6 dashes");
	});

	it("should handle imperial unit system", () => {
		expect(
			quantityToBestUnit({
				quantity: 100,
				unit: "ml",
				unitSystem: "imperial",
			}),
		).toBe("3.38 fl oz");
	});

	it("should default servings to 1 when not provided", () => {
		expect(
			quantityToBestUnit({
				quantity: 50,
				unit: "ml",
				unitSystem: "metric",
			}),
		).toBe("5 cl");
	});
});

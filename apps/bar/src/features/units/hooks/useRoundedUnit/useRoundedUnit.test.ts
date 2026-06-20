import { describe, expect, it } from "vitest";
import { roundUnit } from ".";

describe("roundUnit", () => {
	it("should return [0, 'ml'] for zero volume with metric system", () => {
		expect(roundUnit(0, "metric")).toEqual([0, "ml"]);
	});

	it("should return [0, 'fl_oz'] for zero volume with imperial system", () => {
		expect(roundUnit(0, "imperial")).toEqual([0, "fl_oz"]);
	});

	it("should convert large imperial volumes to gallons", () => {
		const [quantity, unit] = roundUnit(15000, "imperial");
		expect(unit).toBe("gal");
		expect(quantity).toBeCloseTo(3.96, 1);
	});

	it("should convert medium imperial volumes to cups", () => {
		const [quantity, unit] = roundUnit(300, "imperial");
		expect(unit).toBe("cup");
		expect(quantity).toBeCloseTo(1.27, 1);
	});

	it("should convert small imperial volumes to fl oz", () => {
		const [quantity, unit] = roundUnit(100, "imperial");
		expect(unit).toBe("fl_oz");
		expect(quantity).toBeCloseTo(3.38, 1);
	});

	it("should drop to tsp for sub-half-fl_oz imperial volumes", () => {
		const [quantity, unit] = roundUnit(2.46, "imperial");
		expect(unit).toBe("tsp");
		expect(quantity).toBeCloseTo(0.5, 2);
	});

	it("should convert large metric volumes to liters", () => {
		expect(roundUnit(1500, "metric")).toEqual([1.5, "l"]);
	});

	it("should convert medium metric volumes to deciliters", () => {
		expect(roundUnit(250, "metric")).toEqual([2.5, "dl"]);
	});

	it("should convert small metric volumes to centiliters", () => {
		expect(roundUnit(50, "metric")).toEqual([5, "cl"]);
	});

	it("should keep very small metric volumes as ml", () => {
		expect(roundUnit(5, "metric")).toEqual([5, "ml"]);
	});

	it("should default to metric when unitSystem is null", () => {
		expect(roundUnit(100, null)).toEqual([10, "cl"]);
	});
});

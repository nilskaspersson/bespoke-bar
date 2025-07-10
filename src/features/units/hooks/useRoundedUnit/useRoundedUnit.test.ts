import { describe, expect, it } from "vitest";
import { createVolumeFormatter } from "@/utils/formatting";
import { roundUnit } from ".";

const volumeFormatter = createVolumeFormatter("en-GB");

describe("formatVolume", () => {
	it("should return '0 ml' for zero volume with metric system", () => {
		expect(roundUnit(0, "metric", volumeFormatter)).toBe("0 ml");
	});

	it("should return '0 fl oz' for zero volume with imperial system", () => {
		expect(roundUnit(0, "imperial", volumeFormatter)).toBe("0 fl oz");
	});

	it("should format large imperial volumes as gallons", () => {
		expect(roundUnit(15000, "imperial", volumeFormatter)).toBe("3.96 Gallons");
	});

	it("should format medium imperial volumes as cups", () => {
		expect(roundUnit(300, "imperial", volumeFormatter)).toBe("1.27 Cups");
	});

	it("should format small imperial volumes as fl oz", () => {
		expect(roundUnit(100, "imperial", volumeFormatter)).toBe("3.38 fl oz");
	});

	it("should format large metric volumes as liters", () => {
		expect(roundUnit(1500, "metric", volumeFormatter)).toBe("1.5 Litres");
	});

	it("should format medium metric volumes as deciliters", () => {
		expect(roundUnit(250, "metric", volumeFormatter)).toBe("2.5 dl");
	});

	it("should format small metric volumes as centiliters", () => {
		expect(roundUnit(50, "metric", volumeFormatter)).toBe("5 cl");
	});

	it("should format very small metric volumes as ml", () => {
		expect(roundUnit(5, "metric", volumeFormatter)).toBe("5 ml");
	});

	it("should default to metric formatting when unitSystem is null", () => {
		expect(roundUnit(100, null, volumeFormatter)).toBe("10 cl");
	});
});

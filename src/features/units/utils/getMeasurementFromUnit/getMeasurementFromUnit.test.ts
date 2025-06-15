import { describe, expect, test } from "vitest";
import { getMeasurementFromUnit } from ".";

describe("getMeasurementFromUnit", () => {
	test("finds a measurement type for a given ingredient", () => {
		expect(getMeasurementFromUnit("cl")).toBe("volume");
		expect(getMeasurementFromUnit("fl_oz")).toBe("volume");
		expect(getMeasurementFromUnit("l")).toBe("volume");
		expect(getMeasurementFromUnit("ml")).toBe("volume");
		expect(getMeasurementFromUnit("tbsp")).toBe("volume");
		expect(getMeasurementFromUnit("tsp")).toBe("volume");
	});
});

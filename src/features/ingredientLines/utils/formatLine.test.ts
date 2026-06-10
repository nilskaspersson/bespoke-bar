import { describe, expect, test } from "vitest";
import { formatLine } from "./formatLine";

describe("formatLine", () => {
	test("joins quantity, formatted unit, and name", () => {
		expect(formatLine({ quantity: 2, unit: "cl", name: "Aperol" })).toBe(
			"2 cl Aperol",
		);
	});

	test("drops a missing quantity and unit", () => {
		expect(formatLine({ quantity: null, unit: null, name: "Soda" })).toBe(
			"Soda",
		);
	});

	test("keeps quantity when there's no unit", () => {
		expect(formatLine({ quantity: 1, unit: null, name: "Egg" })).toBe("1 Egg");
	});
});

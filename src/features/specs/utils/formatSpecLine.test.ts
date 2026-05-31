import { describe, expect, test } from "vitest";
import { formatSpecLine } from "./formatSpecLine";

describe("formatSpecLine", () => {
	test("joins quantity, formatted unit, and name", () => {
		expect(formatSpecLine({ quantity: 2, unit: "cl", name: "Aperol" })).toBe(
			"2 cl Aperol",
		);
	});

	test("drops a missing quantity and unit", () => {
		expect(formatSpecLine({ quantity: null, unit: null, name: "Soda" })).toBe(
			"Soda",
		);
	});

	test("keeps quantity when there's no unit", () => {
		expect(formatSpecLine({ quantity: 1, unit: null, name: "Egg" })).toBe(
			"1 Egg",
		);
	});
});

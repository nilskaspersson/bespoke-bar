import { describe, expect, it } from "vitest";
import { currencySchema } from ".";

describe("currencySchema", () => {
	it("should parse and format currency strings", () => {
		// Basic numbers
		expect(currencySchema.parse("123.45")).toBe(123.45);
		expect(currencySchema.parse("0")).toBe(0);

		// Currency formatting with symbols and commas
		expect(currencySchema.parse("$1,234.56")).toBe(1234.56);
		expect(currencySchema.parse("1,234.56 EUR")).toBe(1234.56);
		expect(currencySchema.parse(" 123.45kr ")).toBe(123.45);

		// Boundary values
		expect(currencySchema.parse("0.01")).toBe(0.01);
		expect(currencySchema.parse("99999999.99")).toBe(99999999.99);

		// Edge cases
		expect(currencySchema.parse(".50")).toBe(0.5);
		expect(currencySchema.parse("$.99")).toBe(0.99);
	});

	it("should preserve entered precision (display rounding is handled by Intl)", () => {
		expect(currencySchema.parse("123.456")).toBe(123.456);
		expect(currencySchema.parse("0.999")).toBe(0.999);
		// 3-decimal currencies (e.g. KWD) must not be truncated
		expect(currencySchema.parse("1.234")).toBe(1.234);
	});

	it("should reject invalid values", () => {
		expect(() => currencySchema.parse("-1")).toThrow("Price must be positive");
		expect(() => currencySchema.parse("")).toThrow();
		expect(() => currencySchema.parse("   ")).toThrow();
		expect(() => currencySchema.parse("100000000")).toThrow("Price too large");
		expect(() => currencySchema.parse("abc")).toThrow();
		expect(() => currencySchema.parse("$abc")).toThrow();
		expect(() => currencySchema.parse(null)).toThrow();
		expect(() => currencySchema.parse({})).toThrow();
	});
});

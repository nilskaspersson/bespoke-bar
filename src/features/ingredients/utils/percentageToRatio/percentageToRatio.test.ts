import { describe, expect, it } from "vitest";
import { percentageToRatioSchema } from "./.";

describe("percentageToRatioSchema", () => {
	describe("valid percentage inputs", () => {
		it("should convert basic percentage strings to ratios", () => {
			expect(percentageToRatioSchema.parse("50")).toBe(0.5);
			expect(percentageToRatioSchema.parse("75.5")).toBe(0.755);
			expect(percentageToRatioSchema.parse("40.25")).toBe(0.4025);
		});

		it("should handle percentage strings with % symbol", () => {
			expect(percentageToRatioSchema.parse("50.00%")).toBe(0.5);
			expect(percentageToRatioSchema.parse("  75.5%")).toBe(0.755);
			expect(percentageToRatioSchema.parse("40.25 %")).toBe(0.4025);
			expect(percentageToRatioSchema.parse("5%0")).toBe(0.5);
			expect(percentageToRatioSchema.parse("50%%")).toBe(0.5);
		});

		it("should handle edge cases", () => {
			expect(percentageToRatioSchema.parse("0")).toBe(0);
			expect(percentageToRatioSchema.parse("100%")).toBe(1);
		});

		it("should handle decimal precision correctly", () => {
			expect(percentageToRatioSchema.parse("50.5")).toBe(0.505);
			expect(percentageToRatioSchema.parse("33.33")).toBe(0.3333);
			expect(percentageToRatioSchema.parse("66.666")).toBe(0.6667);
			expect(percentageToRatioSchema.parse("12.3658")).toBe(0.1237);
		});

		it("should handle null and undefined inputs", () => {
			expect(percentageToRatioSchema.parse(null)).toBeNull();
			expect(percentageToRatioSchema.parse(undefined)).toBeNull();
		});
	});

	describe("invalid inputs", () => {
		it("should throw ZodError for non-string types", () => {
			expect(() => percentageToRatioSchema.parse(50)).toThrow();
			expect(() => percentageToRatioSchema.parse(true)).toThrow();
			expect(() => percentageToRatioSchema.parse({})).toThrow();
			expect(() => percentageToRatioSchema.parse([])).toThrow();
		});

		it("should return null for empty or whitespace-only strings", () => {
			expect(percentageToRatioSchema.parse("")).toBeNull();
			expect(percentageToRatioSchema.parse("   ")).toBeNull();
			expect(percentageToRatioSchema.parse("\t\n")).toBeNull();
			expect(percentageToRatioSchema.parse("%%")).toBeNull();
		});

		it("should throw ZodError for non-numeric strings", () => {
			expect(() => percentageToRatioSchema.parse("abc")).toThrow();
			expect(() => percentageToRatioSchema.parse("50a")).toThrow();
		});

		it("should throw ZodError for percentages outside valid range", () => {
			expect(() => percentageToRatioSchema.parse("-1")).toThrow();
			expect(() => percentageToRatioSchema.parse("-10%")).toThrow();
			expect(() => percentageToRatioSchema.parse("101")).toThrow();
			expect(() => percentageToRatioSchema.parse("150%")).toThrow();
			expect(() => percentageToRatioSchema.parse("999")).toThrow();
		});

		it("should throw ZodError for special numeric values", () => {
			expect(() => percentageToRatioSchema.parse("Infinity")).toThrow();
			expect(() => percentageToRatioSchema.parse("-Infinity")).toThrow();
			expect(() => percentageToRatioSchema.parse("NaN")).toThrow();
		});
	});

	describe("edge cases and formatting variations", () => {
		it("should handle various whitespace combinations", () => {
			expect(percentageToRatioSchema.parse("\t50%\n")).toBe(0.5);
			expect(percentageToRatioSchema.parse("  25  %  ")).toBe(0.25);
			expect(percentageToRatioSchema.parse("\r\n75.5%\r\n")).toBe(0.755);
		});

		it("should handle case insensitive input", () => {
			expect(percentageToRatioSchema.parse("50%".toUpperCase())).toBe(0.5);
			expect(percentageToRatioSchema.parse("50%")).toBe(0.5);
		});

		it("should handle leading zeros", () => {
			expect(percentageToRatioSchema.parse("05")).toBe(0.05);
			expect(percentageToRatioSchema.parse("005%")).toBe(0.05);
			expect(percentageToRatioSchema.parse("00.5")).toBe(0.005);
		});

		it("should handle decimal-only inputs", () => {
			expect(percentageToRatioSchema.parse(".5")).toBe(0.005);
			expect(percentageToRatioSchema.parse(".5%")).toBe(0.005);
			expect(percentageToRatioSchema.parse("0.5")).toBe(0.005);
		});
	});

	describe("precision and rounding", () => {
		it("should handle reasonable precision decimals", () => {
			expect(percentageToRatioSchema.parse("40.12")).toBe(0.4012);
			expect(percentageToRatioSchema.parse("33.33")).toBe(0.3333);
			expect(percentageToRatioSchema.parse("37.75")).toBe(0.3775);
		});

		it("should round excessive precision to 4 decimal places", () => {
			expect(percentageToRatioSchema.parse("40.123456")).toBe(0.4012);
			expect(percentageToRatioSchema.parse("33.999999")).toBe(0.34);
		});
	});

	describe("safeParse behavior", () => {
		it("should return success object for valid inputs", () => {
			const result = percentageToRatioSchema.safeParse("40%");
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data).toBe(0.4);
			}
		});

		it("should return error object for invalid inputs", () => {
			const result = percentageToRatioSchema.safeParse("invalid");
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBeDefined();
			}
		});

		it("should return success with null for null inputs", () => {
			const result = percentageToRatioSchema.safeParse(null);
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data).toBeNull();
			}
		});
	});
});

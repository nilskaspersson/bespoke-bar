/** biome-ignore-all lint/suspicious/noExplicitAny: We need to test invalid args */
import { describe, expect, it } from "vitest";
import { percentageToRatio } from "./.";

describe("percentageToRatio", () => {
	describe("valid percentage inputs", () => {
		it("should convert basic percentage strings to ratios", () => {
			expect(percentageToRatio("50")).toBe(0.5);
			expect(percentageToRatio("75.5")).toBe(0.755);
			expect(percentageToRatio("40.25")).toBe(0.4025);
		});

		it("should handle percentage strings with % symbol", () => {
			expect(percentageToRatio("50.00%")).toBe(0.5);
			expect(percentageToRatio("  75.5%")).toBe(0.755);
			expect(percentageToRatio("40.25 %")).toBe(0.4025);
			expect(percentageToRatio("5%0")).toBe(0.5);
			expect(percentageToRatio("50%%")).toBe(0.5);
		});

		it("should handle edge cases", () => {
			expect(percentageToRatio("0")).toBe(0);
			expect(percentageToRatio("100%")).toBe(1);
		});

		it("should handle decimal precision correctly", () => {
			expect(percentageToRatio("50.5")).toBe(0.505);
			expect(percentageToRatio("33.33")).toBe(0.3333);
			expect(percentageToRatio("66.666")).toBe(0.6667);
			expect(percentageToRatio("12.3658")).toBe(0.1237);
		});
	});

	describe("invalid inputs", () => {
		it("should return null for non-string types", () => {
			expect(percentageToRatio(null)).toBeNull();
			expect(percentageToRatio(undefined as any)).toBeNull();
			expect(percentageToRatio(50 as any)).toBeNull();
			expect(percentageToRatio(true as any)).toBeNull();
			expect(percentageToRatio({} as any)).toBeNull();
			expect(percentageToRatio([] as any)).toBeNull();
		});

		it("should return null for empty or whitespace-only strings", () => {
			expect(percentageToRatio("")).toBeNull();
			expect(percentageToRatio("   ")).toBeNull();
			expect(percentageToRatio("\t\n")).toBeNull();
		});

		it("should return null for non-numeric strings", () => {
			expect(percentageToRatio("abc")).toBeNull();
			expect(percentageToRatio("50a")).toBeNull();
			expect(percentageToRatio("%%")).toBeNull();
		});

		it("should return null for percentages outside valid range", () => {
			expect(percentageToRatio("-1")).toBeNull();
			expect(percentageToRatio("-10%")).toBeNull();
			expect(percentageToRatio("101")).toBeNull();
			expect(percentageToRatio("150%")).toBeNull();
			expect(percentageToRatio("999")).toBeNull();
		});

		it("should return null for special numeric values", () => {
			expect(percentageToRatio("Infinity")).toBeNull();
			expect(percentageToRatio("-Infinity")).toBeNull();
			expect(percentageToRatio("NaN")).toBeNull();
		});
	});

	describe("edge cases and formatting variations", () => {
		it("should handle various whitespace combinations", () => {
			expect(percentageToRatio("\t50%\n")).toBe(0.5);
			expect(percentageToRatio("  25  %  ")).toBe(0.25);
			expect(percentageToRatio("\r\n75.5%\r\n")).toBe(0.755);
		});

		it("should handle case insensitive input", () => {
			expect(percentageToRatio("50%".toUpperCase())).toBe(0.5);
			expect(percentageToRatio("50%")).toBe(0.5);
		});

		it("should handle leading zeros", () => {
			expect(percentageToRatio("05")).toBe(0.05);
			expect(percentageToRatio("005%")).toBe(0.05);
			expect(percentageToRatio("00.5")).toBe(0.005);
		});

		it("should handle decimal-only inputs", () => {
			expect(percentageToRatio(".5")).toBe(0.005);
			expect(percentageToRatio(".5%")).toBe(0.005);
			expect(percentageToRatio("0.5")).toBe(0.005);
		});
	});

	describe("precision and rounding", () => {
		it("should handle reasonable precision decimals", () => {
			expect(percentageToRatio("40.12")).toBe(0.4012);
			expect(percentageToRatio("33.33")).toBe(0.3333);
			expect(percentageToRatio("37.75")).toBe(0.3775);
		});

		it("should round excessive precision to 4 decimal places", () => {
			expect(percentageToRatio("40.123456")).toBe(0.4012);
			expect(percentageToRatio("33.999999")).toBe(0.34);
		});
	});
});

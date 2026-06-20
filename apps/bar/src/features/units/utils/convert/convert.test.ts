import { describe, expect, test } from "vitest";
import { convert } from "@/features/units/utils/convert";

describe("unit conversion", () => {
	describe("Internal bartending conversions", () => {
		test("converts bartending units to drops", () => {
			expect(convert(1).from("drop").to("drop")).toBe(1);
			expect(convert(1).from("spray").to("drop")).toBe(2);
			expect(convert(1).from("dash").to("drop")).toBe(12);
			expect(convert(1).from("rinse").to("drop")).toBe(40);
			expect(convert(1).from("barspoon").to("drop")).toBe(100);
			expect(convert(1).from("float").to("drop")).toBe(150);
		});

		test("converts between bartending units", () => {
			expect(convert(1).from("dash").to("spray")).toBe(6); // 12 drops / 2 drops per spray
			expect(convert(1).from("barspoon").to("dash")).toBeCloseTo(8.33, 2); // 100 drops / 12 drops per dash
			expect(convert(1).from("float").to("barspoon")).toBe(1.5); // 150 drops / 100 drops per barspoon
			expect(convert(1).from("rinse").to("spray")).toBe(20); // 40 drops / 2 drops per spray
			expect(convert(1).from("float").to("rinse")).toBe(3.75); // 150 drops / 40 drops per rinse
		});
	});

	describe("Bartending to volume conversions", () => {
		test("converts bartending units to milliliters", () => {
			expect(convert(1).from("drop").to("ml")).toBeCloseTo(0.05, 3);
			expect(convert(1).from("spray").to("ml")).toBeCloseTo(0.1, 3);
			expect(convert(1).from("dash").to("ml")).toBeCloseTo(0.6, 3);
			expect(convert(1).from("rinse").to("ml")).toBeCloseTo(2, 3);
			expect(convert(1).from("barspoon").to("ml")).toBeCloseTo(5, 3);
			expect(convert(1).from("float").to("ml")).toBeCloseTo(7.5, 3);
		});

		test("converts bartending units to other volume units", () => {
			expect(convert(1).from("barspoon").to("tsp")).toBeCloseTo(1.014, 2); // 5ml ≈ 1.014 tsp
			expect(convert(1).from("dash").to("tsp")).toBeCloseTo(0.122, 2); // 0.6ml ≈ 0.122 tsp
			expect(convert(1).from("float").to("fl-oz")).toBeCloseTo(0.254, 2); // 7.5ml ≈ 0.254 fl_oz
			expect(convert(1).from("barspoon").to("fl-oz")).toBeCloseTo(0.169, 2); // 5ml ≈ 0.169 fl_oz
		});

		test("converts volume units to bartending units", () => {
			expect(convert(5).from("ml").to("barspoon")).toBeCloseTo(1, 5);
			expect(convert(0.6).from("ml").to("dash")).toBeCloseTo(1, 5);
			expect(convert(0.1).from("ml").to("spray")).toBeCloseTo(1, 5);
			expect(convert(15).from("ml").to("float")).toBe(2); // 15ml = 2 floats
			expect(convert(30).from("ml").to("barspoon")).toBe(6); // 1 oz = 6 barspoons
			expect(convert(1).from("fl-oz").to("barspoon")).toBeCloseTo(5.9147, 3);
		});
	});

	describe("Edge cases and practical scenarios", () => {
		test("handles fractional conversions", () => {
			expect(convert(0.5).from("dash").to("drop")).toBe(6);
			expect(convert(2.5).from("barspoon").to("ml")).toBe(12.5);
			expect(convert(0.25).from("float").to("spray")).toBeCloseTo(18.75, 1); // 0.25 * 150 drops / 2 drops per spray
		});

		test("typical cocktail recipe conversions", () => {
			expect(convert(1).from("rinse").to("ml")).toBe(2);
			expect(convert(3).from("dash").to("ml")).toBeCloseTo(1.8, 1);
			expect(convert(2).from("spray").to("ml")).toBeCloseTo(0.2, 1);
			expect(convert(1).from("float").to("fl-oz")).toBeCloseTo(0.254, 2);
		});

		test("precision with very small amounts", () => {
			expect(convert(1).from("drop").to("fl-oz")).toBeCloseTo(0.00169, 5);
			expect(convert(5).from("drop").to("tsp")).toBeCloseTo(0.051, 3);
		});
	});

	describe("Cross-system conversions", () => {
		test("is sensible", () => {
			expect(convert(1).from("barspoon").to("ml")).toBe(5);
			expect(convert(1).from("dash").to("ml")).toBeCloseTo(0.6, 1);
			expect(convert(1).from("float").to("cl")).toBe(0.75); // 7.5ml = 0.75cl

			expect(convert(1).from("cl").to("barspoon")).toBe(2); // 10ml = 2 barspoons
			expect(convert(5).from("ml").to("dash")).toBeCloseTo(8.33, 2); // 5ml ≈ 8.33 dashes
			expect(convert(1).from("dl").to("float")).toBeCloseTo(13.33, 2); // 100ml ≈ 13.33 floats

			expect(convert(1).from("barspoon").to("fl-oz")).toBeCloseTo(0.169, 3);
			expect(convert(1).from("fl-oz").to("barspoon")).toBeCloseTo(5.915, 3);
		});
	});
});

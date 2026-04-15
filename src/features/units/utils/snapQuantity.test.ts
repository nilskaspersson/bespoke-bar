import { describe, expect, it } from "vitest";
import { snapQuantity } from "./snapQuantity";

describe("snapQuantity", () => {
	describe("metric volume", () => {
		it("preserves exact ml values at the 5ml grid", () => {
			expect(snapQuantity(15, "ml")).toBe(15);
			expect(snapQuantity(20, "ml")).toBe(20);
			expect(snapQuantity(5600, "ml")).toBe(5600);
		});

		it("snaps ml ≥ 10 to the nearest 5", () => {
			expect(snapQuantity(12, "ml")).toBe(10);
			expect(snapQuantity(13, "ml")).toBe(15);
			expect(snapQuantity(17, "ml")).toBe(15);
			expect(snapQuantity(18, "ml")).toBe(20);
		});

		it("snaps ml < 10 to the nearest 1 for precision pours", () => {
			expect(snapQuantity(3, "ml")).toBe(3);
			expect(snapQuantity(7.4, "ml")).toBe(7);
			expect(snapQuantity(7.6, "ml")).toBe(8);
			expect(snapQuantity(0.9, "ml")).toBe(1);
		});

		it("preserves exact cl values that land on the 5ml grid", () => {
			expect(snapQuantity(1.5, "cl")).toBe(1.5);
			expect(snapQuantity(3, "cl")).toBe(3);
			expect(snapQuantity(5, "cl")).toBe(5);
		});

		it("snaps cl to the nearest 0.5 cl (= 5ml)", () => {
			expect(snapQuantity(1.23, "cl")).toBe(1); // 12.3ml → 10ml → 1cl
			expect(snapQuantity(1.7, "cl")).toBe(1.5); // 17ml → 15ml → 1.5cl
			expect(snapQuantity(1.9, "cl")).toBe(2); // 19ml → 20ml → 2cl
		});

		it("preserves small cl values at 1ml precision (<10ml)", () => {
			expect(snapQuantity(0.7, "cl")).toBe(0.7); // 7ml stays 7ml → 0.7cl
			expect(snapQuantity(0.3, "cl")).toBe(0.3); // 3ml stays 3ml → 0.3cl
		});

		it("preserves dl values that land on the 5ml grid", () => {
			expect(snapQuantity(2.5, "dl")).toBe(2.5);
			expect(snapQuantity(5, "dl")).toBe(5);
		});

		it("preserves liter values at 5ml precision regardless of magnitude", () => {
			// The core regression this suite is defending against:
			// 5.6 l should stay 5.6 l, not collapse to 5.5 l.
			expect(snapQuantity(5.6, "l")).toBe(5.6);
			expect(snapQuantity(5.63, "l")).toBe(5.63);
			expect(snapQuantity(1.23, "l")).toBe(1.23); // 1230ml → 1230ml
			expect(snapQuantity(0.5, "l")).toBe(0.5);
			expect(snapQuantity(10, "l")).toBe(10);
		});

		it("snaps liter values to the 5ml grid when needed", () => {
			// 1.234 l = 1234 ml → round to nearest 5 → 1235 ml → 1.235 l
			expect(snapQuantity(1.234, "l")).toBe(1.235);
			// 1.232 l = 1232 ml → round to nearest 5 → 1230 ml → 1.23 l
			expect(snapQuantity(1.232, "l")).toBe(1.23);
		});
	});

	describe("imperial volume", () => {
		it("preserves fl oz values at the 0.25 grid", () => {
			expect(snapQuantity(0.25, "fl_oz")).toBe(0.25);
			expect(snapQuantity(0.5, "fl_oz")).toBe(0.5);
			expect(snapQuantity(1, "fl_oz")).toBe(1);
			expect(snapQuantity(1.5, "fl_oz")).toBe(1.5);
			expect(snapQuantity(2, "fl_oz")).toBe(2);
		});

		it("snaps fl oz to the nearest 0.25", () => {
			expect(snapQuantity(1.1, "fl_oz")).toBe(1);
			expect(snapQuantity(1.3, "fl_oz")).toBe(1.25);
			expect(snapQuantity(1.4, "fl_oz")).toBe(1.5);
			expect(snapQuantity(1.6, "fl_oz")).toBe(1.5);
		});

		it("snaps cup at fl-oz precision, not at cup precision", () => {
			// 1 cup = 8 fl oz → already on the grid
			expect(snapQuantity(1, "cup")).toBe(1);
			// 0.5 cup = 4 fl oz → on the grid
			expect(snapQuantity(0.5, "cup")).toBe(0.5);
			// 0.125 cup = 1 fl oz → on the grid
			expect(snapQuantity(0.125, "cup")).toBe(0.125);
		});

		it("snaps gallons at fl-oz precision, preserving magnitude-proportional detail", () => {
			// The imperial analogue of the 5.6 l case. 5.6 gal ≈ 716.8 fl oz,
			// which snaps to 716.75 fl oz ≈ 5.599609 gal — precision is
			// preserved at drink-pour granularity, not at gallon granularity.
			expect(snapQuantity(5.6, "gal")).toBeCloseTo(5.5996, 4);
			// 1 gal = 128 fl oz → exact grid point.
			expect(snapQuantity(1, "gal")).toBe(1);
			// 0.5 gal = 64 fl oz → exact grid point.
			expect(snapQuantity(0.5, "gal")).toBe(0.5);
		});
	});

	describe("bartending units", () => {
		it("snaps to whole numbers", () => {
			expect(snapQuantity(1, "dash")).toBe(1);
			expect(snapQuantity(2.4, "dash")).toBe(2);
			expect(snapQuantity(2.6, "dash")).toBe(3);
			expect(snapQuantity(0.5, "barspoon")).toBe(1);
			expect(snapQuantity(3, "drop")).toBe(3);
		});
	});

	describe("floating-point noise suppression", () => {
		it("returns clean decimal values for metric round-trips", () => {
			// Without the final round(x, 6), these would pick up 1e-13
			// scale noise from the convert-units multiplication chain.
			expect(snapQuantity(5.6, "l")).toBe(5.6);
			expect(snapQuantity(1.5, "cl")).toBe(1.5);
			expect(snapQuantity(2.5, "dl")).toBe(2.5);
		});
	});
});

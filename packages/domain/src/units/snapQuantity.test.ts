import { describe, expect, it } from "vitest";
import { snapQuantity } from "./snapQuantity";

const POUR = { pour: true } as const;
const BATCH = { batch: true } as const;
const BOTH = { pour: true, batch: true } as const;

describe("snapQuantity", () => {
	describe("no options", () => {
		it("returns the input unchanged when nothing is enabled", () => {
			expect(snapQuantity(1.234, "l")).toBe(1.234);
			expect(snapQuantity(3.87, "qt")).toBe(3.87);
			expect(snapQuantity(2.4, "dash")).toBe(2.4);
		});
	});

	describe("pour precision (ml)", () => {
		it("snaps ≥ 10 ml to the nearest 5", () => {
			expect(snapQuantity(12, "ml", POUR)).toBe(10);
			expect(snapQuantity(13, "ml", POUR)).toBe(15);
			expect(snapQuantity(17, "ml", POUR)).toBe(15);
			expect(snapQuantity(18, "ml", POUR)).toBe(20);
		});

		it("snaps < 10 ml to the nearest 1 for precision pours", () => {
			expect(snapQuantity(3, "ml", POUR)).toBe(3);
			expect(snapQuantity(7.4, "ml", POUR)).toBe(7);
			expect(snapQuantity(7.6, "ml", POUR)).toBe(8);
			expect(snapQuantity(0.9, "ml", POUR)).toBe(1);
		});
	});

	describe("pour precision (cl / dl / l)", () => {
		it("snaps cl to the nearest 0.5", () => {
			expect(snapQuantity(1.7, "cl", POUR)).toBe(1.5);
			expect(snapQuantity(1.9, "cl", POUR)).toBe(2);
			expect(snapQuantity(3, "cl", POUR)).toBe(3);
		});

		it("snaps dl to the nearest 0.5 — 4.95 dl becomes 5 dl", () => {
			expect(snapQuantity(4.95, "dl", POUR)).toBe(5);
			expect(snapQuantity(2.5, "dl", POUR)).toBe(2.5);
			expect(snapQuantity(2.3, "dl", POUR)).toBe(2.5);
		});

		it("snaps l to the nearest 0.1", () => {
			expect(snapQuantity(5.6, "l", POUR)).toBe(5.6);
			expect(snapQuantity(5.63, "l", POUR)).toBe(5.6);
			expect(snapQuantity(1.23, "l", POUR)).toBe(1.2);
			expect(snapQuantity(1.0, "l", POUR)).toBe(1);
		});
	});

	describe("pour precision (imperial volume)", () => {
		it("snaps fl oz to the nearest 0.25", () => {
			expect(snapQuantity(1.1, "fl_oz", POUR)).toBe(1);
			expect(snapQuantity(1.3, "fl_oz", POUR)).toBe(1.25);
			expect(snapQuantity(1.4, "fl_oz", POUR)).toBe(1.5);
			expect(snapQuantity(1.6, "fl_oz", POUR)).toBe(1.5);
		});

		it("snaps cup/qt/gal to the nearest 0.25 of the display unit", () => {
			expect(snapQuantity(1.3, "cup", POUR)).toBe(1.25);
			expect(snapQuantity(1.4, "cup", POUR)).toBe(1.5);
			expect(snapQuantity(5.4, "qt", POUR)).toBe(5.5);
			expect(snapQuantity(5.6, "gal", POUR)).toBe(5.5);
			expect(snapQuantity(1.35, "gal", POUR)).toBe(1.25);
		});
	});

	describe("pour precision (bartending units)", () => {
		it("snaps to whole numbers", () => {
			expect(snapQuantity(2.4, "dash", POUR)).toBe(2);
			expect(snapQuantity(2.6, "dash", POUR)).toBe(3);
			expect(snapQuantity(0.5, "barspoon", POUR)).toBe(1);
		});
	});

	describe("never rounds non-zero quantities to zero", () => {
		it("bumps tiny positive quantities to one step", () => {
			expect(snapQuantity(0.08, "fl_oz", POUR)).toBe(0.25);
			expect(snapQuantity(0.4, "ml", POUR)).toBe(1);
			expect(snapQuantity(0.04, "l", POUR)).toBe(0.1);
		});

		it("preserves true zero", () => {
			expect(snapQuantity(0, "fl_oz", POUR)).toBe(0);
			expect(snapQuantity(0, "ml", POUR)).toBe(0);
		});
	});

	describe("batch rounding", () => {
		it("rounds to 3 significant figures in the display unit", () => {
			expect(snapQuantity(123.75, "fl_oz", BATCH)).toBe(124);
			expect(snapQuantity(173.25, "fl_oz", BATCH)).toBe(173);
			expect(snapQuantity(3.8672, "qt", BATCH)).toBe(3.87);
			expect(snapQuantity(5.5996, "gal", BATCH)).toBe(5.6);
			expect(snapQuantity(1.234, "l", BATCH)).toBe(1.23);
		});

		it("preserves scaled fl-oz at 100+ scale (no tens collapse)", () => {
			expect(snapQuantity(166.25, "fl_oz", BATCH)).toBe(166);
			expect(snapQuantity(175, "fl_oz", BATCH)).toBe(175);
		});

		it("returns zero unchanged", () => {
			expect(snapQuantity(0, "fl_oz", BATCH)).toBe(0);
		});
	});

	describe("combined (pour + batch)", () => {
		it("takes the coarser grid so batch rounding wins at fl-oz scale", () => {
			expect(snapQuantity(173.25, "fl_oz", BOTH)).toBe(173);
		});

		it("lets pour grid win at coarse display units where it is already coarser", () => {
			expect(snapQuantity(3.8672, "qt", BOTH)).toBe(3.75);
			expect(snapQuantity(5.5996, "gal", BOTH)).toBe(5.5);
		});

		it("lets pour win when it is the coarser of the two", () => {
			expect(snapQuantity(1.25, "fl_oz", BOTH)).toBe(1.25);
			expect(snapQuantity(4.95, "dl", BOTH)).toBe(5);
		});

		it("keeps bartending units on whole numbers at batch scale", () => {
			expect(snapQuantity(27, "dash", BOTH)).toBe(27);
			expect(snapQuantity(273, "dash", BOTH)).toBe(273);
		});
	});
});

import { describe, expect, test } from "vitest";
import { getGhostCompletion } from "./getGhostCompletion";

describe("getGhostCompletion", () => {
	test("returns completion suffix for prefix match", () => {
		expect(getGhostCompletion("Sip", "Sipsmith Gin")).toBe("smith Gin");
	});

	test("case-insensitive prefix match", () => {
		expect(getGhostCompletion("sip", "Sipsmith Gin")).toBe("smith Gin");
	});

	test("single character query", () => {
		expect(getGhostCompletion("L", "Lime")).toBe("ime");
	});

	test("returns null for non-prefix match", () => {
		expect(getGhostCompletion("Gin", "Sipsmith Gin")).toBeNull();
	});

	test("returns null for exact match (nothing to complete)", () => {
		expect(getGhostCompletion("Lime", "Lime")).toBeNull();
	});

	test("returns null for exact match case-insensitive", () => {
		expect(getGhostCompletion("lime", "Lime")).toBeNull();
	});

	test("returns null when completion starts with whitespace", () => {
		// "Sipsmith" is a prefix of "Sipsmith Gin" but the completion
		// would be " Gin" (leading space) — reject to avoid ghost text
		// rendering a detached space after the cursor
		expect(getGhostCompletion("Sipsmith", "Sipsmith Gin")).toBeNull();
	});

	test("mid-word query produces valid completion", () => {
		expect(getGhostCompletion("Sipsmit", "Sipsmith Gin")).toBe("h Gin");
	});

	test("returns null when completion is only whitespace", () => {
		expect(getGhostCompletion("Lime", "Lime ")).toBeNull();
	});

	test("empty query never matches", () => {
		// Empty query is a prefix of everything, but the plugin filters
		// these out before calling. Still, the function should handle it.
		expect(getGhostCompletion("", "Lime")).toBe("Lime");
	});

	test("preserves original casing in completion", () => {
		expect(getGhostCompletion("Simple", "Simple Syrup")).toBeNull();
		expect(getGhostCompletion("Simple S", "Simple Syrup")).toBe("yrup");
	});
});

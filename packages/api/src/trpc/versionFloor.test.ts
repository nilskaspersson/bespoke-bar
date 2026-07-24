import { describe, expect, it } from "vitest";
import { isBelowFloor, readClientHeaders } from "./versionFloor";

describe("isBelowFloor", () => {
	it("is true when a segment is lower", () => {
		expect(isBelowFloor("1.2.0", "1.3.0")).toBe(true);
		expect(isBelowFloor("1.2.9", "1.3.0")).toBe(true);
		expect(isBelowFloor("0.9.9", "1.0.0")).toBe(true);
	});

	it("is false at or above the floor", () => {
		expect(isBelowFloor("1.3.0", "1.3.0")).toBe(false);
		expect(isBelowFloor("1.3.1", "1.3.0")).toBe(false);
		expect(isBelowFloor("2.0.0", "1.9.9")).toBe(false);
	});

	it("treats missing trailing segments as zero", () => {
		expect(isBelowFloor("1.2", "1.2.0")).toBe(false);
		expect(isBelowFloor("1.2", "1.2.1")).toBe(true);
		expect(isBelowFloor("1.2.0", "1.2")).toBe(false);
	});

	it("compares numerically, not lexically", () => {
		expect(isBelowFloor("1.9.0", "1.10.0")).toBe(true);
		expect(isBelowFloor("1.10.0", "1.9.0")).toBe(false);
	});

	it("fails open on an unparseable version or floor", () => {
		expect(isBelowFloor("1.2.3-beta", "1.3.0")).toBe(false);
		expect(isBelowFloor("", "1.0.0")).toBe(false);
		expect(isBelowFloor("1.0.0", "not-a-version")).toBe(false);
	});
});

describe("readClientHeaders", () => {
	function headers(entries: Record<string, string>): Headers {
		return new Headers(entries);
	}

	it("returns nulls when no headers are present", () => {
		expect(readClientHeaders()).toEqual({ platform: null, version: null });
		expect(readClientHeaders(headers({}))).toEqual({
			platform: null,
			version: null,
		});
	});

	it("parses a known platform and version", () => {
		expect(
			readClientHeaders(
				headers({ "x-platform": "ios", "x-app-version": "1.4.2" }),
			),
		).toEqual({ platform: "ios", version: "1.4.2" });
	});

	it("rejects an unknown platform and blank version", () => {
		expect(
			readClientHeaders(
				headers({ "x-platform": "web", "x-app-version": "   " }),
			),
		).toEqual({ platform: null, version: null });
	});
});

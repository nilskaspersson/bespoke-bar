import { encode } from "uqr";
import { describe, expect, it } from "vitest";
import { renderHandoffQr } from "./handoffQr";

const URL = `https://bar.example.com/handoff/${"a".repeat(130)}~${"b".repeat(43)}`;

describe("renderHandoffQr", () => {
	it("encodes a full-length link at a screen-friendly version", () => {
		const { version } = encode(URL, { ecc: "M" });
		const { size, path } = renderHandoffQr(URL);

		expect(version).toBeLessThanOrEqual(11);
		expect(size).toBe(version * 4 + 17 + 8);
		expect(path.startsWith("M")).toBe(true);
	});

	it("draws the top-left finder pattern inside the quiet zone", () => {
		const { path } = renderHandoffQr(URL);

		expect(path).toContain("M4 4h7v1h-7z");
		expect(path).toContain("M4 5h1v1h-1zM10 5h1v1h-1z");
	});

	it("merges horizontal runs into single rectangles", () => {
		const { path, size } = renderHandoffQr(URL);
		const runs = path.match(/M\d+ \d+h(\d+)v1h-\1z/g) ?? [];
		const { data } = encode(URL, { ecc: "M", border: 4 });
		const darkModules = data.flat().filter(Boolean).length;

		expect(runs.length).toBeGreaterThan(0);
		expect(runs.length).toBeLessThan(darkModules);
		expect(runs.every((run) => run.length > 0)).toBe(true);
		expect(size).toBe(data.length);
	});
});

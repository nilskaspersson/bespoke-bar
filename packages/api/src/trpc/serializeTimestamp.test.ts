import { readdirSync } from "node:fs";
import path from "node:path";
import { getTableColumns, is } from "drizzle-orm";
import { PgTable } from "drizzle-orm/pg-core";
import { describe, expect, it } from "vitest";
import {
	serializeTimestamp,
	serializeWireTimestamps,
	TIMESTAMP_KEYS,
} from "./serializeTimestamp";

describe("serializeTimestamp", () => {
	it("normalizes pg driver timestamptz text (space, hour-only offset)", () => {
		expect(serializeTimestamp("2026-06-28 16:06:15.414661+00")).toBe(
			"2026-06-28T16:06:15.414Z",
		);
	});

	it("normalizes pg to_json output (T, full offset) from relational-query nesting", () => {
		expect(serializeTimestamp("2026-06-28T16:06:15.414661+00:00")).toBe(
			"2026-06-28T16:06:15.414Z",
		);
	});

	it("converts non-UTC offsets to the same instant", () => {
		expect(serializeTimestamp("2026-06-28 18:06:15.414661+02")).toBe(
			"2026-06-28T16:06:15.414Z",
		);
		expect(serializeTimestamp("2026-06-28T21:36:15.414661+05:30")).toBe(
			"2026-06-28T16:06:15.414Z",
		);
	});

	it("stamps zoneless values as UTC (pre-migration cache, space-separated)", () => {
		expect(serializeTimestamp("2026-06-28 16:06:15.414661")).toBe(
			"2026-06-28T16:06:15.414Z",
		);
		expect(serializeTimestamp("2026-06-28 16:06:15")).toBe(
			"2026-06-28T16:06:15.000Z",
		);
	});

	it("stamps zoneless to_json naive values as UTC (T-separated)", () => {
		expect(serializeTimestamp("2026-06-28T16:06:15.414661")).toBe(
			"2026-06-28T16:06:15.414Z",
		);
	});

	it("passes canonical ISO through unchanged", () => {
		expect(serializeTimestamp("2026-06-28T16:06:15.414Z")).toBe(
			"2026-06-28T16:06:15.414Z",
		);
	});

	it("passes null, empty, and time-less strings through", () => {
		expect(serializeTimestamp(null)).toBeNull();
		expect(serializeTimestamp("")).toBe("");
		expect(serializeTimestamp("2026-06-28")).toBe("2026-06-28");
	});
});

describe("serializeWireTimestamps", () => {
	it("re-stamps timestamp keys at any depth and preserves shape", () => {
		const input = {
			id: "r1",
			createdAt: "2026-06-28 16:06:15.414661+00",
			updatedAt: null,
			lines: [
				{
					createdAt: "2026-06-28T16:06:15.414661+00:00",
					ingredient: { name: "Gin", createdAt: "", updatedAt: null },
				},
			],
		};
		expect(serializeWireTimestamps(input)).toEqual({
			id: "r1",
			createdAt: "2026-06-28T16:06:15.414Z",
			updatedAt: null,
			lines: [
				{
					createdAt: "2026-06-28T16:06:15.414Z",
					ingredient: { name: "Gin", createdAt: "", updatedAt: null },
				},
			],
		});
	});

	it("does not mutate its input", () => {
		const row = { createdAt: "2026-06-28 16:06:15.414661+00" };
		serializeWireTimestamps(row);
		expect(row.createdAt).toBe("2026-06-28 16:06:15.414661+00");
	});

	it("covers every timestamp column in the schema (TIMESTAMP_KEYS cannot drift)", async () => {
		const schemaDir = path.resolve(
			import.meta.dirname,
			"../../../schema/src/schema",
		);
		const files = readdirSync(schemaDir).filter(
			(f) => f.endsWith(".ts") && !f.endsWith(".test.ts"),
		);
		const missing: string[] = [];
		for (const file of files) {
			const mod = await import(path.join(schemaDir, file));
			for (const exported of Object.values(mod)) {
				if (!is(exported, PgTable)) continue;
				for (const [key, column] of Object.entries(getTableColumns(exported))) {
					if (
						column.columnType.includes("Timestamp") &&
						!TIMESTAMP_KEYS.has(key)
					) {
						missing.push(`${file}: ${key}`);
					}
				}
			}
		}
		expect(missing).toEqual([]);
	});

	it("leaves non-timestamp keys and non-string values alone", () => {
		const input = {
			createdBy: "user_1",
			count: 3,
			createdAt: 12345,
			nested: { featuredAt: "2026-06-28 16:06:15+00" },
		};
		const out = serializeWireTimestamps(input);
		expect(out.createdBy).toBe("user_1");
		expect(out.count).toBe(3);
		expect(out.createdAt).toBe(12345);
		expect(out.nested.featuredAt).toBe("2026-06-28T16:06:15.000Z");
	});
});

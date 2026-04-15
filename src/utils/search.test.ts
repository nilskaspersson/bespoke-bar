import { describe, expect, test } from "vitest";
import { createSearchIndex, searchByIndex } from "./search";

type Item = { id: string; name: string; tags: string[] };

const getKey = (item: Item) => item.id;
const getSearchableText = (item: Item) => [item.name, ...item.tags];

const ITEMS: Item[] = [
	{ id: "1", name: "Gin", tags: ["spirit", "juniper"] },
	{ id: "2", name: "Ginger Beer", tags: ["mixer", "spicy"] },
	{ id: "3", name: "Simple Syrup", tags: ["sweetener"] },
	{ id: "4", name: "Lime Juice", tags: ["citrus", "sour"] },
];

describe("createSearchIndex", () => {
	test("builds a map keyed by item key", () => {
		const index = createSearchIndex(ITEMS, getKey, getSearchableText);
		expect(index.size).toBe(4);
		expect(index.has("1")).toBe(true);
		expect(index.has("4")).toBe(true);
	});

	test("concatenates fields with null separator", () => {
		const index = createSearchIndex(ITEMS, getKey, getSearchableText);
		const entry = index.get("1");
		expect(entry).toContain("\0");
		expect(entry?.split("\0")).toEqual(["gin", "spirit", "juniper"]);
	});

	test("handles empty items array", () => {
		const index = createSearchIndex([], getKey, getSearchableText);
		expect(index.size).toBe(0);
	});

	test("normalizes text (lowercase, deburr)", () => {
		const items = [{ id: "1", name: "Curaçao", tags: ["liqueur"] }];
		const index = createSearchIndex(items, getKey, getSearchableText);
		const entry = index.get("1");
		expect(entry).toContain("curacao");
	});
});

describe("searchByIndex", () => {
	const index = createSearchIndex(ITEMS, getKey, getSearchableText);

	test("returns all items for empty query", () => {
		const result = searchByIndex(ITEMS, index, getKey, "");
		expect(result).toEqual(ITEMS);
	});

	test("filters by substring match", () => {
		const result = searchByIndex(ITEMS, index, getKey, "syrup");
		expect(result).toEqual([ITEMS[2]]);
	});

	test("matches across tag fields", () => {
		const result = searchByIndex(ITEMS, index, getKey, "citrus");
		expect(result).toEqual([ITEMS[3]]);
	});

	test("prefix matches come before substring matches", () => {
		const result = searchByIndex(ITEMS, index, getKey, "gin");
		expect(result[0].name).toBe("Gin");
		expect(result[1].name).toBe("Ginger Beer");
		expect(result).toHaveLength(2);
	});

	test("is case-insensitive", () => {
		const result = searchByIndex(ITEMS, index, getKey, "GIN");
		expect(result).toHaveLength(2);
	});

	test("handles accented characters", () => {
		const items = [{ id: "1", name: "Curaçao", tags: [] }];
		const idx = createSearchIndex(items, getKey, getSearchableText);
		const result = searchByIndex(items, idx, getKey, "curacao");
		expect(result).toHaveLength(1);
	});

	test("does not match across field boundaries", () => {
		// "juniper" and "spirit" are in separate fields for Gin
		// A query spanning both should not match
		const result = searchByIndex(ITEMS, index, getKey, "juniperspirit");
		expect(result).toHaveLength(0);
	});

	test("returns empty array when nothing matches", () => {
		const result = searchByIndex(ITEMS, index, getKey, "vodka");
		expect(result).toEqual([]);
	});

	test("excludes items not in the index", () => {
		const extraItems = [...ITEMS, { id: "99", name: "Vodka", tags: [] }];
		const result = searchByIndex(extraItems, index, getKey, "vodka");
		expect(result).toEqual([]);
	});
});

import { describe, expect, test } from "vitest";
import { cacheTags } from "./cache";

describe("cacheTags.recipe", () => {
	test("subscribes per-id to recipe events plus org-wide tag.delete", () => {
		const tags = cacheTags.recipe("org1", "recipe1");

		expect(tags).toEqual([
			"org1:update-recipe:recipe1",
			"org1:delete-recipe:recipe1",
			"org1:delete-tag",
		]);
	});

	test("does not subscribe to ingredient events", () => {
		const tags = cacheTags.recipe("org1", "r1");

		expect(tags.some((t) => t.includes("ingredient"))).toBe(false);
	});

	test("does not subscribe to tag.update", () => {
		const tags = cacheTags.recipe("org1", "r1");

		expect(tags.some((t) => t.includes("update-tag"))).toBe(false);
	});
});

describe("cacheTags.barRecipes", () => {
	test("subscribes org-wide to recipe events plus tag.delete", () => {
		const tags = cacheTags.barRecipes("org1");

		expect(tags).toEqual([
			"org1:create-recipe",
			"org1:update-recipe",
			"org1:delete-recipe",
			"org1:delete-tag",
		]);
	});

	test("does not subscribe to ingredient events", () => {
		const tags = cacheTags.barRecipes("org1");

		expect(tags.some((t) => t.includes("ingredient"))).toBe(false);
	});

	test("does not subscribe to tag.update", () => {
		const tags = cacheTags.barRecipes("org1");

		expect(tags.some((t) => t.includes("update-tag"))).toBe(false);
	});
});

describe("cacheTags.countBarRecipes", () => {
	test("subscribes only to recipe create and delete", () => {
		const tags = cacheTags.countBarRecipes("org1");

		expect(tags).toEqual(["org1:create-recipe", "org1:delete-recipe"]);
	});

	test("does not subscribe to recipe.update or any ingredient/tag events", () => {
		const tags = cacheTags.countBarRecipes("org1");

		expect(tags).not.toContain("org1:update-recipe");
		expect(tags.some((t) => t.includes("ingredient"))).toBe(false);
		expect(tags.some((t) => t.includes("tag"))).toBe(false);
	});
});

describe("cacheTags.ocrQuotaLimit", () => {
	test("subscribes to grant create and org update only", () => {
		const tags = cacheTags.ocrQuotaLimit("org1");

		expect(tags).toEqual([
			"org1:create-ocr-quota-grant",
			"org1:update-organisation",
		]);
	});

	test("does not subscribe to the frequent per-Use event", () => {
		const tags = cacheTags.ocrQuotaLimit("org1");

		expect(tags.some((t) => t.includes("ocr-quota-use"))).toBe(false);
	});
});

describe("cacheTags.ocrQuotaUsage", () => {
	test("subscribes only to the use event", () => {
		const tags = cacheTags.ocrQuotaUsage("org1");

		expect(tags).toEqual(["org1:create-ocr-quota-use"]);
	});

	test("does not subscribe to the rare grant or org event", () => {
		const tags = cacheTags.ocrQuotaUsage("org1");

		expect(tags.some((t) => t.includes("grant"))).toBe(false);
		expect(tags.some((t) => t.includes("organisation"))).toBe(false);
	});
});

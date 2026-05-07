import { describe, expect, test } from "vitest";
import { cacheTags } from "./cache";

describe("cacheTags.recipeWithTags", () => {
	test("subscribes per-id to recipe and tag events", () => {
		const tags = cacheTags.recipeWithTags("org1", "recipe1", ["tag1"]);

		expect(tags).toEqual([
			"org1:update-recipe:recipe1",
			"org1:delete-recipe:recipe1",
			"org1:update-tag:tag1",
			"org1:delete-tag:tag1",
		]);
	});

	test("emits both update and delete subscriptions per recipe-tag", () => {
		const tags = cacheTags.recipeWithTags("org1", "r1", ["t1"]);

		expect(tags).toContain("org1:update-tag:t1");
		expect(tags).toContain("org1:delete-tag:t1");
	});

	test("does not subscribe to ingredient events", () => {
		const tags = cacheTags.recipeWithTags("org1", "r1", ["t1"]);

		expect(tags.some((t) => t.includes("ingredient"))).toBe(false);
	});

	test("does not subscribe org-wide to tag events", () => {
		const tags = cacheTags.recipeWithTags("org1", "r1", ["t1"]);

		expect(tags).not.toContain("org1:update-tag");
		expect(tags).not.toContain("org1:delete-tag");
	});

	test("returns just recipe events when tag array is empty", () => {
		const tags = cacheTags.recipeWithTags("org1", "r1", []);

		expect(tags).toEqual(["org1:update-recipe:r1", "org1:delete-recipe:r1"]);
	});
});

describe("cacheTags.barRecipes", () => {
	test("subscribes org-wide to recipe and tag events", () => {
		const tags = cacheTags.barRecipes("org1");

		expect(tags).toEqual([
			"org1:create-recipe",
			"org1:update-recipe",
			"org1:delete-recipe",
			"org1:update-tag",
			"org1:delete-tag",
		]);
	});

	test("does not subscribe to ingredient events", () => {
		const tags = cacheTags.barRecipes("org1");

		expect(tags.some((t) => t.includes("ingredient"))).toBe(false);
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

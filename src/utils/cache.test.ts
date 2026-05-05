import { describe, expect, test, vi } from "vitest";
import { cacheTags } from "./cache";

describe("cacheTags.recipeWithIngredients", () => {
	test("subscribes per-id to recipe, ingredient, and tag events", () => {
		const tags = cacheTags.recipeWithIngredients(
			"org1",
			"recipe1",
			["ing1", "ing2"],
			["tag1"],
		);

		expect(tags).toEqual([
			"org1:update-recipe:recipe1",
			"org1:delete-recipe:recipe1",
			"org1:update-ingredient:ing1",
			"org1:update-ingredient:ing2",
			"org1:update-tag:tag1",
			"org1:delete-tag:tag1",
		]);
	});

	test("emits both update and delete subscriptions per recipe-tag", () => {
		const tags = cacheTags.recipeWithIngredients("org1", "r1", [], ["t1"]);

		expect(tags).toContain("org1:update-tag:t1");
		expect(tags).toContain("org1:delete-tag:t1");
	});

	test("does not subscribe org-wide to ingredient or tag events", () => {
		const tags = cacheTags.recipeWithIngredients(
			"org1",
			"r1",
			["ing1"],
			["t1"],
		);

		expect(tags).not.toContain("org1:update-ingredient");
		expect(tags).not.toContain("org1:update-tag");
		expect(tags).not.toContain("org1:delete-tag");
	});

	test("does not subscribe to ingredient.delete (FK prevents the case)", () => {
		const tags = cacheTags.recipeWithIngredients("org1", "r1", ["ing1"], []);

		expect(tags.some((t) => t.includes("delete-ingredient"))).toBe(false);
	});

	test("returns just recipe events when ingredient and tag arrays are empty", () => {
		const tags = cacheTags.recipeWithIngredients("org1", "r1", [], []);

		expect(tags).toEqual(["org1:update-recipe:r1", "org1:delete-recipe:r1"]);
	});
});

describe("cacheTags.barRecipes", () => {
	test("uses per-id ingredient and tag subscriptions under the threshold", () => {
		const tags = cacheTags.barRecipes("org1", ["ing1", "ing2"], ["t1"]);

		expect(tags).toContain("org1:create-recipe");
		expect(tags).toContain("org1:update-recipe");
		expect(tags).toContain("org1:delete-recipe");
		expect(tags).toContain("org1:update-ingredient:ing1");
		expect(tags).toContain("org1:update-ingredient:ing2");
		expect(tags).toContain("org1:update-tag:t1");
		expect(tags).toContain("org1:delete-tag:t1");

		expect(tags).not.toContain("org1:update-ingredient");
		expect(tags).not.toContain("org1:update-tag");
	});

	test("returns just the base recipe events for empty inputs", () => {
		const tags = cacheTags.barRecipes("org1", [], []);

		expect(tags).toEqual([
			"org1:create-recipe",
			"org1:update-recipe",
			"org1:delete-recipe",
		]);
	});

	test("falls back to org-wide subscriptions above 60 tags", () => {
		const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
		const ingredientIds = Array.from({ length: 70 }, (_, i) => `ing${i}`);

		const tags = cacheTags.barRecipes("org1", ingredientIds, []);

		expect(tags).toEqual([
			"org1:create-recipe",
			"org1:update-recipe",
			"org1:delete-recipe",
			"org1:update-ingredient",
			"org1:update-tag",
			"org1:delete-tag",
		]);
		expect(warn).toHaveBeenCalledOnce();

		warn.mockRestore();
	});

	test("stays per-id at exactly the 60-tag cushion", () => {
		const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
		// 3 base + 57 ingredients = 60 total, at the cushion but not over.
		const ingredientIds = Array.from({ length: 57 }, (_, i) => `ing${i}`);

		const tags = cacheTags.barRecipes("org1", ingredientIds, []);

		expect(tags).toHaveLength(60);
		expect(tags).toContain("org1:update-ingredient:ing0");
		expect(warn).not.toHaveBeenCalled();

		warn.mockRestore();
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

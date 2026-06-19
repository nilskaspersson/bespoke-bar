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
	test("subscribes to grant create, org update, and the subscription mirror", () => {
		const tags = cacheTags.ocrQuotaLimit("org1");

		expect(tags).toEqual([
			"org1:create-ocr-quota-grant",
			"org1:update-organisation",
			"org1:update-org-subscription",
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

		expect(tags).toEqual(["org1:changed-ocr-quota-use"]);
	});

	test("does not subscribe to the rare grant or org event", () => {
		const tags = cacheTags.ocrQuotaUsage("org1");

		expect(tags.some((t) => t.includes("grant"))).toBe(false);
		expect(tags.some((t) => t.includes("organisation"))).toBe(false);
	});
});

describe("cacheTags.ingredient", () => {
	test("subscribes per-id to ingredient update and delete", () => {
		expect(cacheTags.ingredient("org1", "ing1")).toEqual([
			"org1:update-ingredient:ing1",
			"org1:delete-ingredient:ing1",
		]);
	});
});

describe("cacheTags.ingredientsList", () => {
	test("subscribes org-wide to every ingredient event", () => {
		expect(cacheTags.ingredientsList("org1")).toEqual([
			"org1:create-ingredient",
			"org1:update-ingredient",
			"org1:delete-ingredient",
		]);
	});
});

describe("cacheTags.menus", () => {
	test("subscribes to all menu events plus recipe.delete (the assignment count)", () => {
		expect(cacheTags.menus("org1")).toEqual([
			"org1:create-menu",
			"org1:update-menu",
			"org1:delete-menu",
			"org1:delete-recipe",
		]);
	});

	test("does not subscribe to recipe.create or recipe.update (list shows counts, not content)", () => {
		const tags = cacheTags.menus("org1");

		expect(tags).not.toContain("org1:create-recipe");
		expect(tags).not.toContain("org1:update-recipe");
	});
});

describe("cacheTags.menuWithRecipes", () => {
	test("subscribes per-id to menu events plus org-wide recipe delete and update", () => {
		expect(cacheTags.menuWithRecipes("org1", "menu1")).toEqual([
			"org1:update-menu:menu1",
			"org1:delete-menu:menu1",
			"org1:delete-recipe",
			"org1:update-recipe",
		]);
	});

	test("subscribes to recipe.update (the detail renders recipe content, unlike the list)", () => {
		expect(cacheTags.menuWithRecipes("org1", "menu1")).toContain(
			"org1:update-recipe",
		);
	});

	test("degrades menu tags to org-wide when no id is given (the empty featured-menu state)", () => {
		expect(cacheTags.menuWithRecipes("org1")).toEqual([
			"org1:update-menu",
			"org1:delete-menu",
			"org1:delete-recipe",
			"org1:update-recipe",
		]);
	});
});

describe("cacheTags.favorite.toggle", () => {
	test("subscribes per-user only", () => {
		expect(cacheTags.favorite.toggle("org1", "user1")).toEqual([
			"org1:toggle-favorite:user1",
		]);
	});

	test("has no org-wide tag (favorites are per-user, never cross-user)", () => {
		expect(cacheTags.favorite.toggle("org1", "user1")).not.toContain(
			"org1:toggle-favorite",
		);
	});
});

describe("cacheTags.tagsList", () => {
	test("subscribes to every tag event", () => {
		expect(cacheTags.tagsList("org1")).toEqual([
			"org1:create-tag",
			"org1:update-tag",
			"org1:delete-tag",
		]);
	});
});

describe("cacheTags.recipeSlotLimit", () => {
	test("subscribes to slot-grant create and org update only — Pro slot bonuses are ledgered grants, not live state", () => {
		expect(cacheTags.recipeSlotLimit("org1")).toEqual([
			"org1:create-recipe-slot-grant",
			"org1:update-organisation",
		]);
	});
});

describe("cacheTags.recipeSlotUsage", () => {
	test("subscribes to slot-grant create, recipe create/delete, and org update", () => {
		expect(cacheTags.recipeSlotUsage("org1")).toEqual([
			"org1:create-recipe-slot-grant",
			"org1:create-recipe",
			"org1:delete-recipe",
			"org1:update-organisation",
		]);
	});

	test("does not subscribe to recipe.update (usage is a count of recipes)", () => {
		expect(cacheTags.recipeSlotUsage("org1")).not.toContain(
			"org1:update-recipe",
		);
	});
});

describe("cacheTags.orgSubscription", () => {
	test("subscribes to the subscription mirror update only", () => {
		expect(cacheTags.orgSubscription("org1")).toEqual([
			"org1:update-org-subscription",
		]);
	});
});

describe("cacheTags.organisation", () => {
	test("subscribes to org update only", () => {
		expect(cacheTags.organisation("org1")).toEqual([
			"org1:update-organisation",
		]);
	});

	test("does not subscribe to delete (safe because reads are gated by organisationByClerkId)", () => {
		expect(cacheTags.organisation("org1")).not.toContain(
			"org1:delete-organisation",
		);
	});
});

describe("cacheTags.organisationByClerkId", () => {
	test("subscribes to create and delete, keyed by the clerk org id", () => {
		expect(cacheTags.organisationByClerkId("clerk1")).toEqual([
			"clerk1:create-organisation",
			"clerk1:delete-organisation",
		]);
	});
});

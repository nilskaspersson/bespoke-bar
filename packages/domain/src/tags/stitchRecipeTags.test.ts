import type { RecipeTag } from "@bespoke/schema/schema/recipeTags";
import type { Tag } from "@bespoke/schema/schema/tags";
import { describe, expect, test } from "vitest";
import { buildTagMap, stitchRecipeTags } from "./stitchRecipeTags";

const tag = (id: string, overrides: Partial<Tag> = {}): Tag => ({
	id,
	name: `Tag ${id}`,
	orgId: "org1",
	createdAt: "2026-01-01T00:00:00Z",
	createdBy: "user1",
	updatedAt: null,
	updatedBy: null,
	...overrides,
});

const recipeTag = (
	tagId: string,
	overrides: Partial<RecipeTag> = {},
): RecipeTag => ({
	recipeId: "recipe1",
	tagId,
	orgId: "org1",
	createdAt: "2026-01-01T00:00:00Z",
	...overrides,
});

describe("buildTagMap", () => {
	test("indexes tags by id", () => {
		const map = buildTagMap([tag("a"), tag("b")]);

		expect(map.get("a")?.name).toBe("Tag a");
		expect(map.get("b")?.name).toBe("Tag b");
		expect(map.size).toBe(2);
	});
});

describe("stitchRecipeTags", () => {
	test("attaches the matching tag to each junction row", () => {
		const map = buildTagMap([tag("citrus"), tag("sour")]);

		const stitched = stitchRecipeTags(
			[recipeTag("citrus"), recipeTag("sour")],
			map,
		);

		expect(stitched).toHaveLength(2);
		expect(stitched[0].tag.name).toBe("Tag citrus");
		expect(stitched[1].tag.name).toBe("Tag sour");
	});

	test("preserves junction row fields when stitching", () => {
		const map = buildTagMap([tag("citrus")]);
		const original = recipeTag("citrus", { recipeId: "recipe-X" });

		const [stitched] = stitchRecipeTags([original], map);

		expect(stitched.recipeId).toBe("recipe-X");
		expect(stitched.tagId).toBe("citrus");
	});

	test("falls back to a placeholder tag when missing from map", () => {
		const map = buildTagMap([]);

		const [stitched] = stitchRecipeTags([recipeTag("missing")], map);

		expect(stitched.tag.id).toBe("missing");
		expect(stitched.tag.name).toBe("Unknown tag");
	});
});

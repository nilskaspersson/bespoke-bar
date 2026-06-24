import type { RecipeTagWithTag } from "@bespoke/schema/schema/recipes";
import type { RecipeTag } from "@bespoke/schema/schema/recipeTags";
import type { Tag } from "@bespoke/schema/schema/tags";

export type TagMap = Map<Tag["id"], Tag>;

export function buildTagMap(tags: Tag[]): TagMap {
	return new Map(tags.map((tag) => [tag.id, tag]));
}

function makeFallbackTag(rt: RecipeTag): Tag {
	return {
		id: rt.tagId,
		name: "Unknown tag",
		orgId: rt.orgId,
		createdAt: rt.createdAt,
		createdBy: "",
		updatedAt: null,
		updatedBy: null,
	};
}

export function stitchRecipeTags(
	recipeTags: RecipeTag[],
	tags: TagMap,
): RecipeTagWithTag[] {
	return recipeTags.map((rt) => {
		const tag = tags.get(rt.tagId) ?? makeFallbackTag(rt);
		return { ...rt, tag };
	});
}

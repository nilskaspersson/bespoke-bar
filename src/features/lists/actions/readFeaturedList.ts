import { and, eq, sql } from "drizzle-orm";
import { cacheTag } from "next/cache";
import { db } from "@/db";
import { RecipeListsTable } from "@/db/schema/recipeLists";
import { cacheTags } from "@/utils/cache";

const readFeaturedListPrepared = db.query.RecipeListsTable.findFirst({
	where: and(
		eq(RecipeListsTable.orgId, sql.placeholder("orgId")),
		eq(RecipeListsTable.isFeatured, true),
	),
	with: {
		entries: {
			with: {
				recipe: {
					with: {
						specs: {
							with: {
								ingredient: true,
							},
						},
					},
				},
			},
		},
	},
}).prepare("readFeaturedList");

export async function readFeaturedList(orgId: string) {
	return await readFeaturedListPrepared.execute({ orgId });
}

export async function getCachedFeaturedList(orgId: string) {
	"use cache";
	const list = await readFeaturedList(orgId);
	cacheTag(...cacheTags.recipeListWithRecipes(orgId, list?.id));
	return list;
}

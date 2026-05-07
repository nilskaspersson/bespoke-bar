import { and, eq, sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import { RecipeListsTable } from "@/db/schema/recipeLists";
import { cacheEvents, cacheTags } from "@/utils/cache";

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
						specs: true,
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
	cacheLife("max");
	const list = await readFeaturedList(orgId);
	cacheTag(...cacheTags.recipeListWithRecipes(orgId, list?.id));
	return list;
}

const readFeaturedListIdPrepared = db.query.RecipeListsTable.findFirst({
	where: and(
		eq(RecipeListsTable.orgId, sql.placeholder("orgId")),
		eq(RecipeListsTable.isFeatured, true),
	),
	columns: { id: true },
}).prepare("readFeaturedListId");

export async function getCachedFeaturedListId(orgId: string) {
	"use cache";
	cacheLife("max");
	cacheTag(
		cacheEvents.recipeList.create.tag(orgId),
		cacheEvents.recipeList.update.tag(orgId),
		cacheEvents.recipeList.delete.tag(orgId),
	);
	const row = await readFeaturedListIdPrepared.execute({ orgId });
	return row?.id ?? null;
}

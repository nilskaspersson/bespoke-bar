"use server";

import { and, eq, sql } from "drizzle-orm";
import { unstable_cacheTag as cacheTag } from "next/cache";
import { db } from "@/db";
import { type RecipeList, RecipeListsTable } from "@/db/schema/recipeLists";
import { cacheTags } from "@/utils/cache";

const preparedReadRecipeList = db.query.RecipeListsTable.findFirst({
	where: and(
		eq(RecipeListsTable.id, sql.placeholder("listId")),
		eq(RecipeListsTable.orgId, sql.placeholder("orgId")),
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
}).prepare("readRecipeList");

export async function readRecipeList(orgId: string, id: RecipeList["id"]) {
	const list = await preparedReadRecipeList.execute({
		listId: id,
		orgId,
	});

	return list;
}

export async function getCachedRecipeList(orgId: string, id: RecipeList["id"]) {
	"use cache";
	cacheTag(...cacheTags.recipeListWithRecipes(orgId, id));
	return await readRecipeList(orgId, id);
}

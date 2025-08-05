"use server";

import { and, eq, sql } from "drizzle-orm";
import { unstable_cacheTag as cacheTag } from "next/cache";
import { db } from "@/db";
import { RecipesTable } from "@/db/schema/recipes";
import { getRecipeIdCacheTag } from "@/features/recipes/utils/server";

const preparedReadRecipe = db.query.RecipesTable.findFirst({
	where: and(
		eq(RecipesTable.id, sql.placeholder("recipeId")),

		eq(RecipesTable.orgId, sql.placeholder("orgId")),
	),
	with: {
		specs: {
			with: {
				ingredient: true,
			},
		},
	},
}).prepare("readRecipe");

export async function readRecipe(orgId: string, id: string) {
	const recipe = await preparedReadRecipe.execute({
		recipeId: id,
		orgId,
	});

	return recipe;
}

export async function getCachedRecipe(orgId: string, id: string) {
	"use cache";
	cacheTag(getRecipeIdCacheTag(orgId, id));
	return await readRecipe(orgId, id);
}

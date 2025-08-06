"use server";

import { and, eq, sql } from "drizzle-orm";
import { unstable_cacheTag as cacheTag } from "next/cache";
import { db } from "@/db";
import { type Recipe, RecipesTable } from "@/db/schema/recipes";
import { cacheTags } from "@/utils/cache";

const preparedReadRecipe = db.query.RecipesTable.findFirst({
	where: and(
		eq(RecipesTable.orgId, sql.placeholder("orgId")),
		eq(RecipesTable.id, sql.placeholder("recipeId")),
	),
	with: {
		specs: {
			with: {
				ingredient: true,
			},
		},
	},
}).prepare("readRecipe");

export async function readRecipe(orgId: string, recipeId: Recipe["id"]) {
	return await preparedReadRecipe.execute({
		orgId,
		recipeId,
	});
}

export async function getCachedRecipe(orgId: string, id: Recipe["id"]) {
	"use cache";
	cacheTag(...cacheTags.recipeWithIngredients(orgId, id));
	return await readRecipe(orgId, id);
}

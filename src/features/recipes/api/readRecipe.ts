import { and, eq, sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import { type Recipe, RecipesTable } from "@/db/schema/recipes";
import { cacheTags } from "@/utils/cache";

const preparedReadRecipe = db.query.RecipesTable.findFirst({
	where: and(
		eq(RecipesTable.orgId, sql.placeholder("orgId")),
		eq(RecipesTable.id, sql.placeholder("recipeId")),
	),
	with: {
		lines: true,
		tags: true,
	},
}).prepare("readRecipe");

async function readRecipe(orgId: string, recipeId: Recipe["id"]) {
	return await preparedReadRecipe.execute({
		orgId,
		recipeId,
	});
}

export async function getCachedRecipe(orgId: string, id: Recipe["id"]) {
	"use cache";
	cacheLife("max");
	cacheTag(...cacheTags.recipe(orgId, id));
	return await readRecipe(orgId, id);
}

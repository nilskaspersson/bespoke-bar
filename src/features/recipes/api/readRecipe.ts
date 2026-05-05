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
		specs: {
			with: {
				ingredient: true,
			},
		},
		tags: {
			with: {
				tag: true,
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
	cacheLife("max");
	const recipe = await readRecipe(orgId, id);
	cacheTag(
		...cacheTags.recipeWithIngredients(
			orgId,
			id,
			recipe?.specs.map((s) => s.ingredientId) ?? [],
			recipe?.tags.map((rt) => rt.tagId) ?? [],
		),
	);
	return recipe;
}

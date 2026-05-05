import { desc, eq, sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import { RecipesTable } from "@/db/schema/recipes";
import { cacheTags } from "@/utils/cache";

const preparedReadBarRecipes = db.query.RecipesTable.findMany({
	where: eq(RecipesTable.orgId, sql.placeholder("orgId")),
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
	orderBy: [desc(RecipesTable.createdAt)],
}).prepare("readBarRecipes");

async function readBarRecipes(orgId: string) {
	return await preparedReadBarRecipes.execute({ orgId });
}

export async function getCachedBarRecipes(orgId: string) {
	"use cache";
	cacheLife("max");
	const recipes = await readBarRecipes(orgId);

	const ingredientIds = new Set<string>();
	const tagIds = new Set<string>();
	for (const r of recipes) {
		for (const s of r.specs) ingredientIds.add(s.ingredientId);
		for (const rt of r.tags) tagIds.add(rt.tagId);
	}

	cacheTag(...cacheTags.barRecipes(orgId, [...ingredientIds], [...tagIds]));
	return recipes;
}

import { and, desc, eq, isNull, sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import { RecipesTable } from "@/db/schema/recipes";
import { cacheTags } from "@/utils/cache";

const preparedReadBarRecipes = db.query.RecipesTable.findMany({
	where: and(
		eq(RecipesTable.orgId, sql.placeholder("orgId")),
		isNull(RecipesTable.archivedAt),
	),
	with: {
		specs: {
			with: {
				ingredient: true,
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
	cacheTag(...cacheTags.barRecipes(orgId));
	return await readBarRecipes(orgId);
}

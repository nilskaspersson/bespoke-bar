import { and, desc, eq, isNotNull, sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import { RecipesTable } from "@/db/schema/recipes";
import { cacheTags } from "@/utils/cache";

const preparedReadArchivedBarRecipes = db.query.RecipesTable.findMany({
	where: and(
		eq(RecipesTable.orgId, sql.placeholder("orgId")),
		isNotNull(RecipesTable.archivedAt),
	),
	with: {
		specs: {
			with: {
				ingredient: true,
			},
		},
	},
	orderBy: [desc(RecipesTable.archivedAt)],
}).prepare("readArchivedBarRecipes");

export async function readArchivedBarRecipes(orgId: string) {
	return await preparedReadArchivedBarRecipes.execute({ orgId });
}

export async function getCachedArchivedBarRecipes(orgId: string) {
	"use cache";
	cacheLife("max");
	cacheTag(...cacheTags.barRecipes(orgId));
	return await readArchivedBarRecipes(orgId);
}

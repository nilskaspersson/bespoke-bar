import { and, count, eq, isNotNull } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import { RecipesTable } from "@/db/schema/recipes";
import { cacheTags } from "@/utils/cache";

export async function countArchivedBarRecipes(orgId: string) {
	const [result] = await db
		.select({ count: count() })
		.from(RecipesTable)
		.where(
			and(eq(RecipesTable.orgId, orgId), isNotNull(RecipesTable.archivedAt)),
		);

	return result.count;
}

export async function getCachedCountArchivedBarRecipes(orgId: string) {
	"use cache";
	cacheLife("max");
	cacheTag(...cacheTags.barRecipes(orgId));
	return await countArchivedBarRecipes(orgId);
}

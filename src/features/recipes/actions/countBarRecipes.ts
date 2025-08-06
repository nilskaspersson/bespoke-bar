"use server";

import { and, count, eq, isNull } from "drizzle-orm";
import { unstable_cacheTag as cacheTag } from "next/cache";
import { db } from "@/db";
import { RecipesTable } from "@/db/schema/recipes";
import { cacheTags } from "@/utils/cache";

export async function countBarRecipes(orgId: string) {
	const [result] = await db
		.select({ count: count() })
		.from(RecipesTable)
		.where(and(eq(RecipesTable.orgId, orgId), isNull(RecipesTable.archivedAt)));

	return result.count;
}

export async function getCachedCountBarRecipes(orgId: string) {
	"use cache";
	cacheTag(...cacheTags.barRecipes(orgId));
	return await countBarRecipes(orgId);
}

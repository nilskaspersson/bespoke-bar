import { db } from "@bespoke/db";
import { RecipesTable } from "@bespoke/schema/schema/recipes";
import { count, eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { cacheTags } from "@/utils/cache";

async function countBarRecipes(orgId: string) {
	const [result] = await db
		.select({ count: count() })
		.from(RecipesTable)
		.where(eq(RecipesTable.orgId, orgId));

	return result.count;
}

export async function getCachedCountBarRecipes(orgId: string) {
	"use cache";
	cacheLife("max");
	cacheTag(...cacheTags.countBarRecipes(orgId));
	return await countBarRecipes(orgId);
}

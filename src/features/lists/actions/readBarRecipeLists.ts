"use server";

import { and, count, desc, eq, getTableColumns, sql } from "drizzle-orm";
import { unstable_cacheTag as cacheTag } from "next/cache";
import { db } from "@/db";
import { RecipeListEntriesTable } from "@/db/schema/recipeListEntries";
import {
	RecipeListsTable,
	type RecipeListWithRecipeCount,
} from "@/db/schema/recipeLists";
import { getRecipeListsCacheTag } from "@/features/lists/utils/server";

const preparedReadBarRecipeLists = db
	.select({
		...getTableColumns(RecipeListsTable),
		recipeCount: count(RecipeListEntriesTable.id),
	})
	.from(RecipeListsTable)
	.leftJoin(
		RecipeListEntriesTable,
		and(
			eq(RecipeListEntriesTable.orgId, sql.placeholder("orgId")),
			eq(RecipeListsTable.id, RecipeListEntriesTable.listId),
		),
	)
	.where(eq(RecipeListsTable.orgId, sql.placeholder("orgId")))
	.groupBy(RecipeListsTable.id)
	.orderBy(desc(RecipeListsTable.createdAt))
	.prepare("readBarRecipeLists");

export async function readBarRecipeLists(
	orgId: string,
): Promise<RecipeListWithRecipeCount[]> {
	return preparedReadBarRecipeLists.execute({ orgId });
}

export async function getCachedRecipeLists(orgId: string) {
	"use cache";
	cacheTag(getRecipeListsCacheTag(orgId));
	return await readBarRecipeLists(orgId);
}

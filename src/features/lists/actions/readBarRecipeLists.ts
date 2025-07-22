"use server";

import { count, desc, eq, getTableColumns, sql } from "drizzle-orm";
import { db } from "@/db";
import { RecipeListEntriesTable } from "@/db/schema/recipeListEntries";
import {
	RecipeListsTable,
	type RecipeListWithRecipeCount,
} from "@/db/schema/recipeLists";
import { authOrForbidden } from "@/utils/auth";

const preparedReadBarRecipeLists = db
	.select({
		...getTableColumns(RecipeListsTable),
		recipeCount: count(RecipeListEntriesTable.id),
	})
	.from(RecipeListsTable)
	.leftJoin(
		RecipeListEntriesTable,
		eq(RecipeListsTable.id, RecipeListEntriesTable.listId),
	)
	.where(eq(RecipeListsTable.orgId, sql.placeholder("orgId")))
	.groupBy(RecipeListsTable.id)
	.orderBy(desc(RecipeListsTable.createdAt))
	.prepare("readBarRecipeLists");

export async function readBarRecipeLists(): Promise<
	RecipeListWithRecipeCount[]
> {
	const { orgId } = await authOrForbidden();

	const lists = await preparedReadBarRecipeLists.execute({ orgId });
	return lists;
}

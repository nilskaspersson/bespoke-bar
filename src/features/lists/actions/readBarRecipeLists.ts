"use server";

import { count, desc, eq, getTableColumns } from "drizzle-orm";
import { db } from "@/db";
import { RecipeListEntriesTable } from "@/db/schema/recipeListEntries";
import {
	RecipeListsTable,
	type RecipeListWithRecipeCount,
} from "@/db/schema/recipeLists";
import { authOrForbidden } from "@/utils/auth";

export async function readBarRecipeLists(): Promise<
	RecipeListWithRecipeCount[]
> {
	const { orgId } = await authOrForbidden();

	const lists = await db
		.select({
			...getTableColumns(RecipeListsTable),
			recipeCount: count(RecipeListEntriesTable.id),
		})
		.from(RecipeListsTable)
		.leftJoin(
			RecipeListEntriesTable,
			eq(RecipeListsTable.id, RecipeListEntriesTable.listId),
		)
		.where(eq(RecipeListsTable.orgId, orgId))
		.groupBy(RecipeListsTable.id)
		.orderBy(desc(RecipeListsTable.createdAt));

	return lists;
}

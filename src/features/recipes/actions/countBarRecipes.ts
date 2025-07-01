"use server";

import { and, count, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { RecipesTable } from "@/db/schema/recipes";
import { authOrForbidden } from "@/utils/auth";

export async function countBarRecipes() {
	const { orgId } = await authOrForbidden();

	const [result] = await db
		.select({ count: count() })
		.from(RecipesTable)
		.where(and(eq(RecipesTable.orgId, orgId), isNull(RecipesTable.archivedAt)));

	return result.count;
}

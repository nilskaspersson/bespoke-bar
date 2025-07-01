"use server";

import { and, count, eq, isNotNull } from "drizzle-orm";
import { db } from "@/db";
import { RecipesTable } from "@/db/schema/recipes";
import { authOrForbidden } from "@/utils/auth";

export async function countArchivedBarRecipes() {
	const { orgId } = await authOrForbidden();

	const [result] = await db
		.select({ count: count() })
		.from(RecipesTable)
		.where(
			and(eq(RecipesTable.orgId, orgId), isNotNull(RecipesTable.archivedAt)),
		);

	return result.count;
}

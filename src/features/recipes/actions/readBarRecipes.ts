"use server";

import { and, desc, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { RecipesTable } from "@/db/schema/recipes";
import { authOrForbidden } from "@/utils/auth";

export async function readBarRecipes() {
	const { orgId } = await authOrForbidden();

	const recipes = await db.query.RecipesTable.findMany({
		where: and(eq(RecipesTable.orgId, orgId), isNull(RecipesTable.archivedAt)),
		with: {
			specs: {
				with: {
					ingredient: true,
				},
			},
		},
		orderBy: [desc(RecipesTable.createdAt)],
	});

	return recipes;
}

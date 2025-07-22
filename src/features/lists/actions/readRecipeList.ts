"use server";

import { and, eq, or } from "drizzle-orm";
import { db } from "@/db";
import { RecipeListsTable } from "@/db/schema/recipeLists";
import { authOrForbidden } from "@/utils/auth";

export async function readRecipeList(id: string | undefined) {
	if (!id) {
		return undefined;
	}

	const { userId, orgId } = await authOrForbidden();

	const list = await db.query.RecipeListsTable.findFirst({
		where: and(
			eq(RecipeListsTable.id, id),
			or(
				eq(RecipeListsTable.createdBy, userId),
				eq(RecipeListsTable.orgId, orgId),
			),
		),
		with: {
			entries: {
				with: {
					recipe: true,
				},
			},
		},
	});

	return list;
}

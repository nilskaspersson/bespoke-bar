"use server";

import { and, eq, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { RecipeListsTable } from "@/db/schema/recipeLists";
import { authOrForbidden } from "@/utils/auth";

const preparedReadRecipeList = db.query.RecipeListsTable.findFirst({
	where: and(
		eq(RecipeListsTable.id, sql.placeholder("listId")),
		or(
			eq(RecipeListsTable.createdBy, sql.placeholder("userId")),
			eq(RecipeListsTable.orgId, sql.placeholder("orgId")),
		),
	),
	with: {
		entries: {
			with: {
				recipe: {
					with: {
						specs: {
							with: {
								ingredient: true,
							},
						},
					},
				},
			},
		},
	},
}).prepare("readRecipeList");

export async function readRecipeList(id: string | undefined) {
	if (!id) {
		return undefined;
	}

	const { userId, orgId } = await authOrForbidden();

	const list = await preparedReadRecipeList.execute({
		listId: id,
		userId,
		orgId,
	});

	return list;
}

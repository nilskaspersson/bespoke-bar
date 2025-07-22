"use server";

import { and, eq, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { RecipesTable } from "@/db/schema/recipes";
import { authOrForbidden } from "@/utils/auth";

const preparedReadRecipe = db.query.RecipesTable.findFirst({
	where: and(
		eq(RecipesTable.id, sql.placeholder("recipeId")),
		or(
			eq(RecipesTable.createdBy, sql.placeholder("userId")),
			eq(RecipesTable.orgId, sql.placeholder("orgId")),
		),
	),
	with: {
		specs: {
			with: {
				ingredient: true,
			},
		},
	},
}).prepare("readRecipe");

export async function readRecipe(id: string | undefined) {
	if (!id) {
		return undefined;
	}

	const { userId, orgId } = await authOrForbidden();

	const recipe = await preparedReadRecipe.execute({
		recipeId: id,
		userId,
		orgId,
	});

	return recipe;
}

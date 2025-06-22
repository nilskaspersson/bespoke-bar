"use server";

import { and, eq, or } from "drizzle-orm";
import { db } from "@/db";
import { RecipesTable } from "@/db/schema/recipes";
import { authOrForbidden } from "@/utils/auth";

export async function readRecipe(id: string | undefined) {
	if (!id) {
		return undefined;
	}

	const { userId, orgId } = await authOrForbidden();

	const recipe = await db.query.RecipesTable.findFirst({
		where: and(
			eq(RecipesTable.id, id),
			or(eq(RecipesTable.createdBy, userId), eq(RecipesTable.orgId, orgId)),
		),
		with: {
			specs: {
				with: {
					ingredient: true,
				},
			},
		},
	});

	return recipe;
}

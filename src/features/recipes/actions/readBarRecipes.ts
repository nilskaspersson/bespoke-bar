"use server";

import { and, eq, isNotNull, isNull } from "drizzle-orm";
import { db } from "@/db";
import { RecipesTable } from "@/db/schema/recipes";
import { authOrForbidden } from "@/utils/auth";

export async function readBarRecipes(options?: { archivedRecipes?: boolean }) {
	const { orgId } = await authOrForbidden();

	const recipes = await db.query.RecipesTable.findMany({
		where: and(
			eq(RecipesTable.orgId, orgId),
			options?.archivedRecipes
				? isNotNull(RecipesTable.archivedAt)
				: isNull(RecipesTable.archivedAt),
		),
	});

	return recipes;
}

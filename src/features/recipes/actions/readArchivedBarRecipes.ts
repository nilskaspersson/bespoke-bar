"use server";

import { and, desc, eq, isNotNull, sql } from "drizzle-orm";
import { db } from "@/db";
import { RecipesTable } from "@/db/schema/recipes";
import { authOrForbidden } from "@/utils/auth";

const preparedReadArchivedBarRecipes = db.query.RecipesTable.findMany({
	where: and(
		eq(RecipesTable.orgId, sql.placeholder("orgId")),
		isNotNull(RecipesTable.archivedAt),
	),
	with: {
		specs: {
			with: {
				ingredient: true,
			},
		},
	},
	orderBy: [desc(RecipesTable.archivedAt)],
}).prepare("readArchivedBarRecipes");

export async function readArchivedBarRecipes() {
	const { orgId } = await authOrForbidden();

	const recipes = await preparedReadArchivedBarRecipes.execute({ orgId });
	return recipes;
}

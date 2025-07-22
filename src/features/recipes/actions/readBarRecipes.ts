"use server";

import { and, desc, eq, isNull, sql } from "drizzle-orm";
import { db } from "@/db";
import { RecipesTable } from "@/db/schema/recipes";
import { authOrForbidden } from "@/utils/auth";

const preparedReadBarRecipes = db.query.RecipesTable.findMany({
	where: and(
		eq(RecipesTable.orgId, sql.placeholder("orgId")),
		isNull(RecipesTable.archivedAt),
	),
	with: {
		specs: {
			with: {
				ingredient: true,
			},
		},
	},
	orderBy: [desc(RecipesTable.createdAt)],
}).prepare("readBarRecipes");

export async function readBarRecipes() {
	const { orgId } = await authOrForbidden();
	return await preparedReadBarRecipes.execute({ orgId });
}

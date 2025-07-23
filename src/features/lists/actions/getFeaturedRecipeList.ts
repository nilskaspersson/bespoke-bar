"use server";

import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { RecipeListsTable } from "@/db/schema/recipeLists";
import { authOrForbidden } from "@/utils/auth";

const readFeaturedListPrepared = db.query.RecipeListsTable.findFirst({
	where: and(
		eq(RecipeListsTable.orgId, sql.placeholder("orgId")),
		eq(RecipeListsTable.isFeatured, true),
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
}).prepare("readFeaturedList");

export async function readFeaturedList() {
	const { orgId } = await authOrForbidden();

	const featuredList = await readFeaturedListPrepared.execute({ orgId });
	return featuredList;
}

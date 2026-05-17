import { and, desc, eq, sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import type { RecipeListWithEntries } from "@/db/schema/composite";
import { RecipeListsTable } from "@/db/schema/recipeLists";
import { cacheTags } from "@/utils/cache";

const preparedReadBarRecipeLists = db.query.RecipeListsTable.findMany({
	where: and(eq(RecipeListsTable.orgId, sql.placeholder("orgId"))),
	with: {
		entries: true,
	},
	orderBy: [
		desc(
			sql`COALESCE(${RecipeListsTable.updatedAt}, ${RecipeListsTable.createdAt})`,
		),
	],
}).prepare("readBarRecipeLists");

export async function readBarRecipeLists(
	orgId: string,
): Promise<RecipeListWithEntries[]> {
	return preparedReadBarRecipeLists.execute({ orgId });
}

export async function getCachedRecipeLists(orgId: string) {
	"use cache";
	cacheLife("max");
	cacheTag(...cacheTags.recipeLists(orgId));
	return await readBarRecipeLists(orgId);
}

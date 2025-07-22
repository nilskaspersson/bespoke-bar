import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { RecipeListsTable } from "@/db/schema/recipeLists";
import { authOrForbidden } from "@/utils/auth";

export async function clearFeaturedList() {
	const { orgId } = await authOrForbidden();

	await db
		.update(RecipeListsTable)
		.set({
			isFeatured: false,
			featuredAt: null,
		})
		.where(
			and(
				eq(RecipeListsTable.orgId, orgId),
				eq(RecipeListsTable.isFeatured, true),
			),
		);
}

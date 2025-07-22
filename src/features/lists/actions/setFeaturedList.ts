import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { RecipeListsTable } from "@/db/schema/recipeLists";
import { authOrForbidden } from "@/utils/auth";

export async function setFeaturedList(listId: string) {
	const { orgId } = await authOrForbidden();

	await db.transaction(async (tx) => {
		await tx
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

		await tx
			.update(RecipeListsTable)
			.set({
				isFeatured: true,
				featuredAt: new Date(),
			})
			.where(
				and(eq(RecipeListsTable.id, listId), eq(RecipeListsTable.orgId, orgId)),
			);
	});
}

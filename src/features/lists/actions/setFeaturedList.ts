import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { RecipeListsTable } from "@/db/schema/recipeLists";
import { revalidateRecipeListPaths } from "@/features/lists/utils/server";
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
				featuredAt: sql`NOW()`,
			})
			.where(
				and(eq(RecipeListsTable.id, listId), eq(RecipeListsTable.orgId, orgId)),
			);
	});

	revalidatePath("/bar", "page");
	revalidateRecipeListPaths(listId);
}

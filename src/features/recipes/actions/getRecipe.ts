import { auth } from "@clerk/nextjs/server";
import { and, eq, or } from "drizzle-orm";
import { forbidden } from "next/navigation";
import { db } from "@/db";
import { RecipesTable } from "@/db/schema/recipes";

export async function getRecipe(id: string | undefined) {
	if (!id) {
		return undefined;
	}

	const { userId, orgId } = await auth();

	if (!userId) {
		forbidden();
	}

	const recipe = await db.query.RecipesTable.findFirst({
		where: and(
			eq(RecipesTable.id, id),
			/**
			 * If user is in an org context, they can see any recipe within that organisation.
			 * Otherwise only match recipes they created.
			 */
			orgId
				? or(eq(RecipesTable.createdBy, userId), eq(RecipesTable.orgId, orgId))
				: eq(RecipesTable.createdBy, userId),
		),
		with: {
			specs: true,
		},
	});

	return recipe;
}

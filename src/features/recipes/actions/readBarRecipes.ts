"use server";

import { auth } from "@clerk/nextjs/server";
import { and, eq, isNotNull, isNull } from "drizzle-orm";
import { forbidden } from "next/navigation";
import { db } from "@/db";
import { RecipesTable } from "@/db/schema/recipes";

export async function readBarRecipes(options?: { archivedRecipes?: boolean }) {
	const { orgId } = await auth();

	if (!orgId) {
		forbidden();
	}

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

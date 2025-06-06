"use server";

import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { forbidden } from "next/navigation";
import { db } from "@/db";
import { RecipesTable } from "@/db/schema/recipes";

export async function readBarRecipes() {
	const { orgId } = await auth();

	if (!orgId) {
		forbidden();
	}

	const recipes = await db.query.RecipesTable.findMany({
		where: eq(RecipesTable.orgId, orgId),
	});

	return recipes;
}

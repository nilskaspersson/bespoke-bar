"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { IngredientsTable } from "@/db/schema/ingredients";
import { authOrForbidden } from "@/utils/auth";

export async function readIngredients() {
	const { orgId } = await authOrForbidden();

	const ingredients = await db.query.IngredientsTable.findMany({
		where: eq(IngredientsTable.orgId, orgId),
	});

	return ingredients;
}

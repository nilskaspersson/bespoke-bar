"use server";

import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { IngredientsTable } from "@/db/schema/ingredients";
import { authOrForbidden } from "@/utils/auth";

export async function readIngredient(id: string | undefined) {
	if (!id) {
		return undefined;
	}

	const { orgId } = await authOrForbidden();

	const ingredient = await db.query.IngredientsTable.findFirst({
		where: and(eq(IngredientsTable.orgId, orgId), eq(IngredientsTable.id, id)),
	});

	return ingredient;
}

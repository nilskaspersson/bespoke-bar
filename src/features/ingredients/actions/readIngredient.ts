"use server";

import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { IngredientsTable } from "@/db/schema/ingredients";
import { authOrForbidden } from "@/utils/auth";

const preparedReadIngredient = db.query.IngredientsTable.findFirst({
	where: and(
		eq(IngredientsTable.orgId, sql.placeholder("orgId")),
		eq(IngredientsTable.id, sql.placeholder("ingredientId")),
	),
}).prepare("readIngredient");

export async function readIngredient(id: string | undefined) {
	if (!id) {
		return undefined;
	}

	const { orgId } = await authOrForbidden();

	const ingredient = await preparedReadIngredient.execute({
		orgId,
		ingredientId: id,
	});

	return ingredient;
}

"use server";

import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { IngredientsTable } from "@/db/schema/ingredients";
import { authOrForbidden } from "@/utils/auth";

const preparedReadIngredients = db.query.IngredientsTable.findMany({
	where: eq(IngredientsTable.orgId, sql.placeholder("orgId")),
}).prepare("readIngredients");

export async function readIngredients() {
	const { orgId } = await authOrForbidden();
	return await preparedReadIngredients.execute({ orgId });
}

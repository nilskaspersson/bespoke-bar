import { db } from "@bespoke/db";
import { IngredientsTable } from "@bespoke/schema/schema/ingredients";
import { eq, sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { cacheTags } from "@/utils/cache";

const preparedReadIngredients = db.query.IngredientsTable.findMany({
	where: eq(IngredientsTable.orgId, sql.placeholder("orgId")),
}).prepare("readIngredients");

/** @public */
export async function readIngredients(orgId: string) {
	return await preparedReadIngredients.execute({ orgId });
}

export async function getCachedIngredients(orgId: string) {
	"use cache";
	cacheLife("max");
	cacheTag(...cacheTags.ingredientsList(orgId));
	return await readIngredients(orgId);
}

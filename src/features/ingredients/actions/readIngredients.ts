"use server";

import { eq, sql } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { db } from "@/db";
import { IngredientsTable } from "@/db/schema/ingredients";
import { cacheTags } from "@/utils/cache";

const preparedReadIngredients = db.query.IngredientsTable.findMany({
	where: eq(IngredientsTable.orgId, sql.placeholder("orgId")),
}).prepare("readIngredients");

export async function readIngredients(orgId: string) {
	return await preparedReadIngredients.execute({ orgId });
}

export async function getCachedIngredients(orgId: string) {
	"use cache";
	cacheTag(...cacheTags.ingredientsList(orgId));
	return await readIngredients(orgId);
}

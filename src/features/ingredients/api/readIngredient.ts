import { and, eq, sql } from "drizzle-orm";
import { cacheTag } from "next/cache";
import { db } from "@/db";
import { type Ingredient, IngredientsTable } from "@/db/schema/ingredients";
import { cacheTags } from "@/utils/cache";

const preparedReadIngredient = db.query.IngredientsTable.findFirst({
	where: and(
		eq(IngredientsTable.orgId, sql.placeholder("orgId")),
		eq(IngredientsTable.id, sql.placeholder("ingredientId")),
	),
}).prepare("readIngredient");

export async function readIngredient(orgId: string, id: Ingredient["id"]) {
	return await preparedReadIngredient.execute({
		orgId,
		ingredientId: id,
	});
}

export async function getCachedIngredient(orgId: string, id: Ingredient["id"]) {
	"use cache";
	cacheTag(...cacheTags.ingredient(orgId, id));
	return await readIngredient(orgId, id);
}

import { db } from "@bespoke/db";
import {
	type Ingredient,
	IngredientsTable,
} from "@bespoke/schema/schema/ingredients";
import { and, eq, sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { cacheTags } from "../cache";

const preparedReadIngredient = db.query.IngredientsTable.findFirst({
	where: and(
		eq(IngredientsTable.orgId, sql.placeholder("orgId")),
		eq(IngredientsTable.id, sql.placeholder("ingredientId")),
	),
}).prepare("readIngredient");

/** @public */
export async function readIngredient(orgId: string, id: Ingredient["id"]) {
	return await preparedReadIngredient.execute({
		orgId,
		ingredientId: id,
	});
}

export async function getCachedIngredient(orgId: string, id: Ingredient["id"]) {
	"use cache";
	cacheLife("max");
	cacheTag(...cacheTags.ingredient(orgId, id));
	return await readIngredient(orgId, id);
}

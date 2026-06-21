import { db } from "@bespoke/db";
import {
	DEFAULT_BASE_RECIPE_SLOTS,
	OrganisationsTable,
} from "@bespoke/schema/schema/organisations";
import { RecipeSlotGrantsTable } from "@bespoke/schema/schema/recipeSlotGrants";
import { RecipesTable } from "@bespoke/schema/schema/recipes";
import { sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { cacheTags } from "@/utils/cache";

export type RecipeSlotUsage = {
	used: number;
	limit: number;
	remaining: number;
};

/**
 * Single-roundtrip read of the org's count, base slots, and grant total. The
 * three are independent scalar subqueries — Postgres runs them in one query
 * plan and we get back a single row. Cheaper than the three-`Promise.all`
 * pattern under network-bound conditions (Neon serverless).
 */
export async function getRecipeSlotUsage(
	orgId: string,
): Promise<RecipeSlotUsage> {
	const { rows } = await db.execute<{
		used: number;
		base: number | null;
		grants: number;
	}>(sql`
		SELECT
			(SELECT count(*)::int
				FROM ${RecipesTable}
				WHERE ${RecipesTable.orgId} = ${orgId}) AS used,
			(SELECT ${OrganisationsTable.baseRecipeSlots}
				FROM ${OrganisationsTable}
				WHERE ${OrganisationsTable.id} = ${orgId}) AS base,
			(SELECT coalesce(sum(${RecipeSlotGrantsTable.amount}), 0)::int
				FROM ${RecipeSlotGrantsTable}
				WHERE ${RecipeSlotGrantsTable.orgId} = ${orgId}) AS grants
	`);

	const { used, base, grants } = rows[0];
	const baseSlots = base ?? DEFAULT_BASE_RECIPE_SLOTS;
	const limit = baseSlots + grants;

	return { used, limit, remaining: Math.max(0, limit - used) };
}

export async function getCachedRecipeSlotUsage(
	orgId: string,
): Promise<RecipeSlotUsage> {
	"use cache";
	cacheLife("max");
	cacheTag(...cacheTags.recipeSlotUsage(orgId));
	return await getRecipeSlotUsage(orgId);
}

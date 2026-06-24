import { db } from "@bespoke/db";
import {
	DEFAULT_BASE_RECIPE_SLOTS,
	OrganisationsTable,
} from "@bespoke/schema/schema/organisations";
import { RecipeSlotGrantsTable } from "@bespoke/schema/schema/recipeSlotGrants";
import { eq, sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { cacheTags } from "../cache";

export async function getRecipeSlotLimit(orgId: string): Promise<number> {
	const [[org], [grants]] = await Promise.all([
		db
			.select({ baseRecipeSlots: OrganisationsTable.baseRecipeSlots })
			.from(OrganisationsTable)
			.where(eq(OrganisationsTable.id, orgId)),
		db
			.select({
				total: sql<number>`coalesce(sum(${RecipeSlotGrantsTable.amount}), 0)::int`,
			})
			.from(RecipeSlotGrantsTable)
			.where(eq(RecipeSlotGrantsTable.orgId, orgId)),
	]);

	const base = org?.baseRecipeSlots ?? DEFAULT_BASE_RECIPE_SLOTS;
	return base + (grants?.total ?? 0);
}

export async function getCachedRecipeSlotLimit(orgId: string): Promise<number> {
	"use cache";
	cacheLife("max");
	cacheTag(...cacheTags.recipeSlotLimit(orgId));
	return await getRecipeSlotLimit(orgId);
}

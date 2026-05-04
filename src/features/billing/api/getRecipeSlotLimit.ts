import { eq, sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import {
	DEFAULT_BASE_RECIPE_SLOTS,
	OrganisationsTable,
} from "@/db/schema/organisations";
import { RecipeSlotGrantsTable } from "@/db/schema/recipeSlotGrants";
import { cacheTags } from "@/utils/cache";

/**
 * `orgId` is the Clerk org ID. The local `organisations` row may not have been
 * created yet — fall back to the schema default so the limit check stays
 * functional in that window.
 */
export async function getRecipeSlotLimit(orgId: string): Promise<number> {
	const [[org], [grants]] = await Promise.all([
		db
			.select({ baseRecipeSlots: OrganisationsTable.baseRecipeSlots })
			.from(OrganisationsTable)
			.where(eq(OrganisationsTable.clerkOrgId, orgId)),
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

import { index, pgTable, uniqueIndex } from "drizzle-orm/pg-core";
import { grantLedgerColumns } from "./columns";

export const RecipeSlotGrantsTable = pgTable(
	"recipe_slot_grants",
	grantLedgerColumns(),
	(t) => [
		index("recipe_slot_grants_org_id_idx").on(t.orgId),
		uniqueIndex("recipe_slot_grants_external_id_uq").on(t.externalId),
	],
);

export type RecipeSlotGrant = typeof RecipeSlotGrantsTable.$inferSelect;
export type InsertRecipeSlotGrant = typeof RecipeSlotGrantsTable.$inferInsert;

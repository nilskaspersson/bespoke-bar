import {
	index,
	integer,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
} from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";

/**
 * `orgId` is the Clerk org ID (matches `RecipesTable.orgId`), not a FK to
 * `OrganisationsTable.id`. The local `organisations` row may not exist yet
 * for a given Clerk org — recipes are written without that guarantee, and
 * grants follow the same convention.
 */
export const RecipeSlotGrantsTable = pgTable(
	"recipe_slot_grants",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => nanoid(10)),
		orgId: text("org_id").notNull(),
		amount: integer("amount").notNull(),
		source: text("source", {
			enum: [
				"purchase",
				"bonus_referral",
				"bonus_activity",
				"manual",
				"refund",
			],
		}).notNull(),
		/**
		 * Namespaced idempotency key. Examples:
		 *   "stripe:cs_test_abc123"   (purchase)
		 *   "referral:<referralId>"   (bonus_referral)
		 *   "daily:2026-05-03:<orgId>" (bonus_activity)
		 *   "refund:<originalGrantId>" (refund)
		 * Null is allowed for manual grants, where dedupe is the operator's job.
		 */
		externalId: text("external_id"),
		note: text("note"),
		createdBy: text("created_by"),
		createdAt: timestamp("created_at", { mode: "string" })
			.defaultNow()
			.notNull(),
	},
	(t) => [
		index("recipe_slot_grants_org_id_idx").on(t.orgId),
		uniqueIndex("recipe_slot_grants_external_id_uq").on(t.externalId),
	],
);

export type RecipeSlotGrant = typeof RecipeSlotGrantsTable.$inferSelect;
export type InsertRecipeSlotGrant = typeof RecipeSlotGrantsTable.$inferInsert;

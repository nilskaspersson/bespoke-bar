import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod";
import { createdAtCol, nanoidPk } from "./columns";
import { OrganisationsTable } from "./organisations";

/**
 * Mirrors Stripe's subscription statuses. Kept a `text` column because Stripe
 * owns the shape.
 */
const SUBSCRIPTION_STATUSES = [
	"active",
	"past_due",
	"canceled",
	"incomplete",
	"incomplete_expired",
	"trialing",
	"unpaid",
	"paused",
] as const;

export const subscriptionStatusSchema = z.enum(SUBSCRIPTION_STATUSES);
export type SubscriptionStatus = z.infer<typeof subscriptionStatusSchema>;

export const PRO_ACTIVE_STATUSES = new Set<SubscriptionStatus>(["active"]);

export function isProActive(
	status: SubscriptionStatus | null | undefined,
): boolean {
	return status != null && PRO_ACTIVE_STATUSES.has(status);
}

export type SubscriptionAttention = "pending_first_payment" | "payment_failed";

export function subscriptionAttention(
	status: SubscriptionStatus,
): SubscriptionAttention | null {
	switch (status) {
		case "incomplete":
			return "pending_first_payment";

		case "past_due":
		case "unpaid":
			return "payment_failed";

		default:
			return null;
	}
}

export const OrgSubscriptionsTable = pgTable("org_subscriptions", {
	id: nanoidPk(),
	orgId: text("org_id")
		.notNull()
		.unique()
		.references(() => OrganisationsTable.id, { onDelete: "cascade" }),
	stripeCustomerId: text("stripe_customer_id").notNull(),
	stripeSubscriptionId: text("stripe_subscription_id").notNull().unique(),
	status: text("status", { enum: SUBSCRIPTION_STATUSES }).notNull(),
	priceId: text("price_id").notNull(),
	currentPeriodEnd: timestamp("current_period_end", {
		mode: "string",
	}).notNull(),
	cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
	createdBy: text("created_by"),
	createdAt: createdAtCol(),
	updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
});

export type OrgSubscription = typeof OrgSubscriptionsTable.$inferSelect;
export type InsertOrgSubscription = typeof OrgSubscriptionsTable.$inferInsert;

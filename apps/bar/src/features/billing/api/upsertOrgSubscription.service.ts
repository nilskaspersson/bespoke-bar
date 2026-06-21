import { db } from "@bespoke/db";
import {
	type InsertOrgSubscription,
	OrgSubscriptionsTable,
} from "@bespoke/schema/schema/orgSubscriptions";
import { sql } from "drizzle-orm";
import { cacheEvents } from "@/utils/cache";

/**
 * Last-write-wins: callers re-fetch the subscription from Stripe first, so
 * out-of-order webhook delivery can't write stale state.
 */
export async function upsertOrgSubscription(
	values: InsertOrgSubscription,
): Promise<void> {
	await db
		.insert(OrgSubscriptionsTable)
		.values(values)
		.onConflictDoUpdate({
			target: OrgSubscriptionsTable.orgId,
			set: {
				stripeCustomerId: values.stripeCustomerId,
				stripeSubscriptionId: values.stripeSubscriptionId,
				status: values.status,
				priceId: values.priceId,
				currentPeriodEnd: values.currentPeriodEnd,
				cancelAtPeriodEnd: values.cancelAtPeriodEnd,
				createdBy: values.createdBy,
				updatedAt: sql`NOW()`,
			},
		});

	cacheEvents.orgSubscription.update.emit(values.orgId);
}

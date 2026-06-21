import { db } from "@bespoke/db";
import { OrganisationsTable } from "@bespoke/schema/schema/organisations";
import { eq, sql } from "drizzle-orm";
import Stripe from "stripe";
import { getStripe } from "@/features/billing/stripe";
import { cacheEvents } from "@/utils/cache";

/**
 * A stored Customer id can dangle: a Dashboard delete (GDPR erasure, tidying)
 * leaves the object retrievable with `deleted: true`, while a test-data purge
 * removes it entirely (`resource_missing`) — and purges fire no webhooks, so
 * verify-on-read is the only reliable detection.
 */
async function customerStillExists(customerId: string): Promise<boolean> {
	try {
		const customer = await getStripe().customers.retrieve(customerId);
		return !customer.deleted;
	} catch (error) {
		if (
			error instanceof Stripe.errors.StripeInvalidRequestError &&
			error.code === "resource_missing"
		) {
			return false;
		}
		throw error;
	}
}

/**
 * The org's Stripe Customer, minted lazily on first checkout — subscription or
 * slot pack alike, since both must share one Customer for the Customer Portal
 * to list every receipt in one place. The Customer carries the payer's email
 * (receipts read correctly); the entitlement target stays the org.
 *
 * Two concurrent first-checkouts can mint two Customers; tolerated, matching
 * the slot-limit race stance (single payer per org in v1) — the loser's
 * Customer dangles unused.
 */
export async function getOrCreateStripeCustomer({
	orgId,
	userId,
	email,
}: {
	orgId: string;
	userId: string;
	email: string;
}): Promise<string> {
	const [org] = await db
		.select({ stripeCustomerId: OrganisationsTable.stripeCustomerId })
		.from(OrganisationsTable)
		.where(eq(OrganisationsTable.id, orgId))
		.limit(1);

	if (
		org?.stripeCustomerId &&
		(await customerStillExists(org.stripeCustomerId))
	) {
		return org.stripeCustomerId;
	}

	const customer = await getStripe().customers.create({
		email,
		metadata: { orgId, clerkUserId: userId },
	});

	await db
		.update(OrganisationsTable)
		.set({ stripeCustomerId: customer.id, updatedAt: sql`NOW()` })
		.where(eq(OrganisationsTable.id, orgId));

	cacheEvents.organisation.update.emit(orgId);

	return customer.id;
}

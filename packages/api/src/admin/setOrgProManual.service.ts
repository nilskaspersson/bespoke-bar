import { db } from "@bespoke/db";
import { OrganisationsTable } from "@bespoke/schema/schema/organisations";
import { eq } from "drizzle-orm";
import { getOrgSubscription } from "../billing/getOrgSubscription";
import { upsertOrgSubscription } from "../billing/upsertOrgSubscription.service";

/**
 * Sentinels keep the NOT NULL Stripe columns satisfied for a comp with no real
 * subscription. Keyed per org so the `stripe_subscription_id` unique constraint
 * never collides, and a later real webhook (conflict on `orgId`) overwrites it.
 */
const MANUAL_PREFIX = "manual:";

export async function setOrgProManual({
	orgId,
	expiresAt,
	createdBy,
}: {
	orgId: string;
	expiresAt: Date;
	createdBy?: string;
}): Promise<void> {
	const existing = await getOrgSubscription(orgId);

	await upsertOrgSubscription({
		orgId,
		stripeCustomerId:
			existing?.stripeCustomerId ??
			(await orgStripeCustomerId(orgId)) ??
			`${MANUAL_PREFIX}${orgId}`,
		stripeSubscriptionId:
			existing?.stripeSubscriptionId ?? `${MANUAL_PREFIX}${orgId}`,
		status: "active",
		priceId: existing?.priceId ?? process.env.STRIPE_PRO_PRICE_ID ?? "manual",
		currentPeriodEnd: expiresAt.toISOString(),
		cancelAtPeriodEnd: false,
		createdBy: createdBy ?? null,
	});
}

/**
 * Keeps the row so a real Stripe sub can later reclaim it via the orgId conflict.
 */
export async function revokeOrgProManual({
	orgId,
}: {
	orgId: string;
}): Promise<void> {
	const existing = await getOrgSubscription(orgId);
	if (!existing) {
		return;
	}

	await upsertOrgSubscription({
		orgId,
		stripeCustomerId: existing.stripeCustomerId,
		stripeSubscriptionId: existing.stripeSubscriptionId,
		status: "canceled",
		priceId: existing.priceId,
		currentPeriodEnd: existing.currentPeriodEnd,
		cancelAtPeriodEnd: existing.cancelAtPeriodEnd,
		createdBy: existing.createdBy,
	});
}

async function orgStripeCustomerId(orgId: string): Promise<string | null> {
	const [row] = await db
		.select({ stripeCustomerId: OrganisationsTable.stripeCustomerId })
		.from(OrganisationsTable)
		.where(eq(OrganisationsTable.id, orgId))
		.limit(1);

	return row?.stripeCustomerId ?? null;
}

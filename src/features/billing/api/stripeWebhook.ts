import type Stripe from "stripe";
import { z } from "zod";
import {
	type InsertOrgSubscription,
	isProActive,
	subscriptionStatusSchema,
} from "@/db/schema/orgSubscriptions";
import {
	PRO_MONTHLY_SLOT_BONUS,
	PRO_SIGNUP_SLOT_BONUS,
} from "@/features/billing/constants";

const slotPackMetadataSchema = z.object({
	orgId: z.string().min(1),
	slotAmount: z.coerce.number().int().positive(),
	createdBy: z.string().min(1).optional(),
});

export type SlotPackGrant = {
	orgId: string;
	amount: number;
	externalId: string;
	createdBy?: string;
};

/**
 * The metadata was written server-side at session creation (`slotAmount`
 * resolves from env config, never client input); a session without it is not
 * ours — null lets the webhook log and acknowledge instead of retrying forever.
 */
export function slotPackGrantFromSession(
	session: Stripe.Checkout.Session,
): SlotPackGrant | null {
	const parsed = slotPackMetadataSchema.safeParse(session.metadata);

	if (!parsed.success) {
		return null;
	}

	return {
		orgId: parsed.data.orgId,
		amount: parsed.data.slotAmount,
		externalId: `stripe:${session.id}`,
		createdBy: parsed.data.createdBy,
	};
}

/**
 * Null when the subscription carries no orgId metadata, no item, or an unknown
 * status — all unexpected for subscriptions our checkout minted; the caller
 * logs. `current_period_end` lives on the subscription item since Stripe's
 * Basil API versions.
 */
export function mirrorFromSubscription(
	subscription: Stripe.Subscription,
): InsertOrgSubscription | null {
	const orgId = subscription.metadata?.orgId;
	const item = subscription.items?.data[0];
	const status = subscriptionStatusSchema.safeParse(subscription.status);

	if (!orgId || !item || !status.success) {
		return null;
	}

	return {
		orgId,
		stripeCustomerId:
			typeof subscription.customer === "string"
				? subscription.customer
				: subscription.customer.id,
		stripeSubscriptionId: subscription.id,
		status: status.data,
		priceId: item.price.id,
		currentPeriodEnd: new Date(item.current_period_end * 1000).toISOString(),
		cancelAtPeriodEnd: subscription.cancel_at_period_end,
		createdBy: subscription.metadata?.createdBy ?? null,
	};
}

export type ProBonusGrant = {
	orgId: string;
	amount: number;
	externalId: string;
	note: string;
	createdBy?: string;
};

function utcMonthIndex(ms: number): number {
	const date = new Date(ms);
	return date.getUTCFullYear() * 12 + date.getUTCMonth();
}

function utcMonthKey(ms: number): string {
	const date = new Date(ms);
	const month = String(date.getUTCMonth() + 1).padStart(2, "0");
	return `${date.getUTCFullYear()}-${month}`;
}

/**
 * Both grants are idempotent by `externalId`, so webhook redelivery and
 * cancel/resubscribe flapping can't double-grant. The signup bonus self-heals
 * (fixed key, any later event re-mints and downstream idempotency dedupes); the
 * loyalty grant does NOT — its key is the *processing-time* month, so a month
 * with no processed subscription event (webhook outage across a month boundary)
 * is skipped for good. Accepted: +5 against a 50 base, framed as generosity.
 */
export function proBonusGrantsFromSubscription(
	subscription: Stripe.Subscription,
	nowMs: number,
): ProBonusGrant[] {
	const orgId = subscription.metadata?.orgId;
	const status = subscriptionStatusSchema.safeParse(subscription.status);

	if (!orgId || !status.success || !isProActive(status.data)) {
		return [];
	}

	const createdBy = subscription.metadata?.createdBy;
	const grants: ProBonusGrant[] = [
		{
			orgId,
			amount: PRO_SIGNUP_SLOT_BONUS,
			externalId: `pro-signup:${orgId}`,
			note: "Pro first-signup bonus",
			createdBy,
		},
	];

	if (utcMonthIndex(subscription.created * 1000) < utcMonthIndex(nowMs)) {
		grants.push({
			orgId,
			amount: PRO_MONTHLY_SLOT_BONUS,
			externalId: `pro-month:${utcMonthKey(nowMs)}:${orgId}`,
			note: "Pro loyalty accrual",
			createdBy,
		});
	}

	return grants;
}

/**
 * Only the subscription's *first* invoice (`billing_reason:
 * "subscription_create"`) qualifies — refunding a later month is ordinary churn
 * and keeps the gift. `orgId` comes from the invoice's immutable
 * subscription-metadata snapshot, so no extra retrieve is needed.
 */
export function signupGrantKeyFromRefundedInvoice(
	invoice: Stripe.Invoice | Stripe.DeletedInvoice,
): string | null {
	if (invoice.deleted || invoice.billing_reason !== "subscription_create") {
		return null;
	}

	const orgId = invoice.parent?.subscription_details?.metadata?.orgId;
	return orgId ? `pro-signup:${orgId}` : null;
}

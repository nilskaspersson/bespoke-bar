import { and, eq, isNull, sql } from "drizzle-orm";
import type { NextRequest } from "next/server";
import type Stripe from "stripe";
import { db } from "@/db";
import { OrganisationsTable } from "@/db/schema/organisations";
import {
	clawBackSlotGrant,
	issueSlotGrant,
} from "@/features/billing/api/issueSlotGrant.service";
import {
	mirrorFromSubscription,
	proBonusGrantsFromSubscription,
	signupGrantKeyFromRefundedInvoice,
	slotPackGrantFromSession,
} from "@/features/billing/api/stripeWebhook";
import { upsertOrgSubscription } from "@/features/billing/api/upsertOrgSubscription.service";
import { getStripe } from "@/features/billing/stripe";
import { cacheEvents } from "@/utils/cache";

function stripeId(
	ref: string | { id: string } | null | undefined,
): string | undefined {
	return typeof ref === "string" ? ref : ref?.id;
}

/**
 * Stripe webhook receiver, mirroring the Clerk one: verify the signature,
 * handle known events, 200 everything else so Stripe doesn't retry forever.
 * Errors while handling DO propagate (→ 500 → Stripe redelivers); both write
 * paths are idempotent (grant `external_id` dedupe, last-write mirror
 * upsert), so at-least-once delivery is safe.
 */
export async function POST(req: NextRequest) {
	const signature = req.headers.get("stripe-signature");
	const secret = process.env.STRIPE_WEBHOOK_SECRET;

	if (!signature || !secret) {
		return new Response("Missing signature", { status: 401 });
	}

	let event: Stripe.Event;
	try {
		event = getStripe().webhooks.constructEvent(
			await req.text(),
			signature,
			secret,
		);
	} catch (error) {
		console.warn("Stripe webhook signature verification failed", error);
		return new Response("Invalid signature", { status: 401 });
	}

	switch (event.type) {
		/**
		 * Delayed-notification methods send `async_payment_succeeded` once the
		 * money actually moves — same Session object, same handler, idempotent
		 * grant. (`async_payment_failed` needs nothing: nothing was granted.)
		 */
		case "checkout.session.completed":
		case "checkout.session.async_payment_succeeded": {
			await handleCheckoutCompleted(event.data.object);
			break;
		}
		case "customer.subscription.created":
		case "customer.subscription.updated":
		case "customer.subscription.deleted": {
			await syncSubscriptionMirror(event.data.object.id);
			break;
		}
		case "charge.refunded": {
			await handleChargeRefunded(event.data.object);
			break;
		}
		case "charge.dispute.funds_withdrawn": {
			await handleDisputeFundsWithdrawn(event.data.object);
			break;
		}
	}

	return new Response("OK", { status: 200 });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
	if (session.mode === "payment") {
		/**
		 * Delayed-notification methods (e.g. SEPA debit) complete the session
		 * days before the money clears — granting here would hand out slots for
		 * a payment that can still bounce. `async_payment_succeeded` re-enters
		 * this handler once it's actually paid.
		 */
		if (session.payment_status === "unpaid") {
			return;
		}

		const grant = slotPackGrantFromSession(session);

		if (!grant) {
			console.error("Payment session without slot-pack metadata", {
				sessionId: session.id,
			});
			return;
		}

		await issueSlotGrant({
			...grant,
			source: "purchase",
			fromRouteHandler: true,
		});
		return;
	}

	/**
	 * Subscription checkout: backstop the customer mapping. Normally
	 * getOrCreateStripeCustomer already persisted it (and busted the cache)
	 * before the session existed, so the `isNull` guard makes this a no-op. In
	 * the rare case it does write, bust the cached `hasStripeCustomer` reader
	 * (a `cacheLife("max")` reader of this column, gating the Portal link) so
	 * the link isn't hidden forever — via `revalidateTag`, since `updateTag` is
	 * illegal in a Route Handler.
	 */
	if (session.mode === "subscription") {
		const orgId = session.metadata?.orgId;
		const customerId = stripeId(session.customer);

		if (!orgId || !customerId) {
			return;
		}

		const updated = await db
			.update(OrganisationsTable)
			.set({ stripeCustomerId: customerId, updatedAt: sql`NOW()` })
			.where(
				and(
					eq(OrganisationsTable.id, orgId),
					isNull(OrganisationsTable.stripeCustomerId),
				),
			)
			.returning({ id: OrganisationsTable.id });

		if (updated.length > 0) {
			cacheEvents.organisation.update.emitFromRouteHandler(orgId);
		}
	}
}

/**
 * Re-fetch then upsert: the retrieved object is always current truth, so
 * out-of-order delivery (an `updated` arriving after `deleted`) can't regress
 * the mirror. Deleted subscriptions stay retrievable with status "canceled".
 */
async function syncSubscriptionMirror(subscriptionId: string) {
	const subscription = await getStripe().subscriptions.retrieve(subscriptionId);
	const mirror = mirrorFromSubscription(subscription);

	if (!mirror) {
		console.error("Stripe subscription is missing mirror data", {
			subscriptionId,
		});
		return;
	}

	await upsertOrgSubscription(mirror);

	for (const grant of proBonusGrantsFromSubscription(
		subscription,
		Date.now(),
	)) {
		await issueSlotGrant({
			...grant,
			source: "bonus_activity",
			fromRouteHandler: true,
		});
	}
}

/**
 * Partial refunds change nothing — `charge.refunded` only goes true once
 * fully refunded.
 */
async function handleChargeRefunded(charge: Stripe.Charge) {
	const paymentIntentId = stripeId(charge.payment_intent);

	if (!charge.refunded || !paymentIntentId) {
		return;
	}

	await clawBackForPaymentIntent(paymentIntentId, "refunded");
}

/**
 * A chargeback is economically a refund that never fires `charge.refunded`;
 * `funds_withdrawn` is the moment the money actually leaves. A later *won*
 * dispute (`funds_reinstated`) is rare enough that restoring the grant is a
 * manual call.
 */
async function handleDisputeFundsWithdrawn(dispute: Stripe.Dispute) {
	const paymentIntentId = stripeId(dispute.payment_intent);

	if (!paymentIntentId) {
		return;
	}

	await clawBackForPaymentIntent(paymentIntentId, "disputed");
}

/**
 * Undo what the payment bought: a slot-pack purchase claws back its grant, a
 * subscription's *first* invoice claws back the Pro signup bonus. Clawbacks
 * are negative ledger entries keyed by the original grant id — idempotent
 * under redelivery, and a no-op when the original grant never landed.
 */
async function clawBackForPaymentIntent(
	paymentIntentId: string,
	reason: "refunded" | "disputed",
) {
	/** A payment-mode Checkout Session carries its PaymentIntent directly. */
	const sessions = await getStripe().checkout.sessions.list({
		payment_intent: paymentIntentId,
		limit: 1,
	});
	const session = sessions.data[0];

	if (session) {
		if (session.mode === "payment") {
			await clawBackSlotGrant({
				originalExternalId: `stripe:${session.id}`,
				note: `Slot pack purchase ${reason}`,
				fromRouteHandler: true,
			});
		}
		return;
	}

	/** Subscription payments route through an invoice instead. */
	const payments = await getStripe().invoicePayments.list({
		payment: { type: "payment_intent", payment_intent: paymentIntentId },
		expand: ["data.invoice"],
		limit: 1,
	});
	const invoice = payments.data[0]?.invoice;

	if (!invoice || typeof invoice === "string") {
		return;
	}

	const signupGrantKey = signupGrantKeyFromRefundedInvoice(invoice);
	if (signupGrantKey) {
		await clawBackSlotGrant({
			originalExternalId: signupGrantKey,
			note: `Pro first payment ${reason}`,
			fromRouteHandler: true,
		});
	}
}

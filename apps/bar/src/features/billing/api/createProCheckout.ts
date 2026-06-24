"use server";

import { authOrForbidden } from "@bespoke/api/auth";
import {
	payerEmail,
	requestOrigin,
	taxParams,
} from "@bespoke/api/billing/checkoutContext";
import { getOrCreateStripeCustomer } from "@bespoke/api/billing/getOrCreateStripeCustomer.service";
import { getStripe } from "@bespoke/api/billing/stripe";
import { rateLimit } from "@bespoke/api/rateLimit";
import { type ActionResult, catchKnownErrors } from "@/utils/serverAction";

export async function createProCheckout(): Promise<
	ActionResult<{ url: string }>
> {
	return catchKnownErrors(async () => {
		const { orgId, userId } = await authOrForbidden();

		await rateLimit(userId);

		const priceId = process.env.STRIPE_PRO_PRICE_ID;
		if (!priceId?.startsWith("price_")) {
			throw new Error(
				`STRIPE_PRO_PRICE_ID must be a Price id ("price_…"), got "${priceId ?? "unset"}" — copy the id from the product's price, not the product itself`,
			);
		}

		const [customer, origin] = await Promise.all([
			payerEmail().then((email) =>
				getOrCreateStripeCustomer({ orgId, userId, email }),
			),
			requestOrigin(),
		]);

		const session = await getStripe().checkout.sessions.create({
			mode: "subscription",
			customer,
			line_items: [{ price: priceId, quantity: 1 }],
			/**
			 * orgId on the subscription feeds every `customer.subscription.*`
			 * mirror sync; on the session it feeds `checkout.session.completed`.
			 */
			subscription_data: { metadata: { orgId, createdBy: userId } },
			metadata: { orgId, createdBy: userId },
			success_url: `${origin}/settings?checkout=success`,
			cancel_url: `${origin}/settings?checkout=cancelled`,
			...taxParams(),
		});

		if (!session.url) {
			throw new Error("Stripe returned no Checkout URL");
		}

		return { url: session.url };
	});
}

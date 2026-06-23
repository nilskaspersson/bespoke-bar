"use server";

import { authOrForbidden } from "@bespoke/api/auth";
import {
	payerEmail,
	requestOrigin,
} from "@bespoke/api/billing/checkoutContext";
import { getOrCreateStripeCustomer } from "@bespoke/api/billing/getOrCreateStripeCustomer.service";
import { getStripe } from "@bespoke/api/billing/stripe";
import { rateLimit } from "@bespoke/api/rateLimit";
import { type ActionResult, catchKnownErrors } from "@/utils/serverAction";

export async function createBillingPortalSession(): Promise<
	ActionResult<{ url: string }>
> {
	return catchKnownErrors(async () => {
		const { orgId, userId } = await authOrForbidden();

		await rateLimit(userId);

		const [customer, origin] = await Promise.all([
			payerEmail().then((email) =>
				getOrCreateStripeCustomer({ orgId, userId, email }),
			),
			requestOrigin(),
		]);

		const session = await getStripe().billingPortal.sessions.create({
			customer,
			return_url: `${origin}/settings`,
		});

		return { url: session.url };
	});
}

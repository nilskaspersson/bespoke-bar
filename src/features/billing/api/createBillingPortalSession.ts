"use server";

import {
	payerEmail,
	requestOrigin,
} from "@/features/billing/api/checkoutContext";
import { getOrCreateStripeCustomer } from "@/features/billing/api/getOrCreateStripeCustomer.service";
import { getStripe } from "@/features/billing/stripe";
import { rateLimit } from "@/rateLimit";
import { authOrForbidden } from "@/utils/auth";
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
			return_url: `${origin}/bar/settings`,
		});

		return { url: session.url };
	});
}

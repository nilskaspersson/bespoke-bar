"use server";

import { authOrForbidden } from "@bespoke/api/auth";
import {
	payerEmail,
	requestOrigin,
	taxParams,
} from "@bespoke/api/billing/checkoutContext";
import { getOrCreateStripeCustomer } from "@bespoke/api/billing/getOrCreateStripeCustomer.service";
import { findSlotPack } from "@bespoke/api/billing/slotPacks";
import { getStripe } from "@bespoke/api/billing/stripe";
import { rateLimit } from "@bespoke/api/rateLimit";
import { z } from "zod";
import { type ActionResult, catchKnownErrors } from "@/utils/serverAction";

const inputSchema = z.object({
	priceId: z.string().min(1),
});

export async function createSlotPackCheckout(
	input: unknown,
): Promise<ActionResult<{ url: string }>> {
	return catchKnownErrors(async () => {
		const { orgId, userId } = await authOrForbidden();

		await rateLimit(userId);

		const { priceId } = inputSchema.parse(input);
		const pack = findSlotPack(priceId);

		if (!pack) {
			throw new Error(`Unknown slot pack price: ${priceId}`);
		}

		const [customer, origin] = await Promise.all([
			payerEmail().then((email) =>
				getOrCreateStripeCustomer({ orgId, userId, email }),
			),
			requestOrigin(),
		]);

		const session = await getStripe().checkout.sessions.create({
			mode: "payment",
			customer,
			line_items: [{ price: pack.priceId, quantity: 1 }],
			invoice_creation: { enabled: true },
			payment_intent_data: { metadata: { orgId, createdBy: userId } },
			metadata: {
				orgId,
				createdBy: userId,
				slotAmount: String(pack.slotAmount),
			},
			success_url: `${origin}/bar/settings?checkout=success`,
			cancel_url: `${origin}/bar/settings?checkout=cancelled`,
			...taxParams(),
		});

		if (!session.url) {
			throw new Error("Stripe returned no Checkout URL");
		}

		return { url: session.url };
	});
}

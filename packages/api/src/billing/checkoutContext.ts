import { currentUser } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { isAutomaticTaxEnabled } from "./stripe";

/**
 * The payer's email for the Stripe Customer — receipts address the person,
 * the entitlement targets the org.
 */
export async function payerEmail(): Promise<string> {
	const user = await currentUser();
	const email =
		user?.primaryEmailAddress?.emailAddress ??
		user?.emailAddresses[0]?.emailAddress;

	if (!email) {
		throw new Error("Authenticated user has no email address");
	}

	return email;
}

export async function requestOrigin(): Promise<string> {
	const origin = (await headers()).get("origin");

	if (!origin) {
		throw new Error("Request carries no origin header");
	}

	return origin;
}

/**
 * Spread into Checkout Session params. Address capture exists purely to feed
 * Stripe Tax, so both toggle together on the env flag.
 */
export function taxParams() {
	if (!isAutomaticTaxEnabled()) {
		return {};
	}

	return {
		automatic_tax: { enabled: true as const },
		customer_update: { address: "auto" as const },
	};
}

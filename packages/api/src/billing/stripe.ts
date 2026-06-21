import Stripe from "stripe";

let client: Stripe | null = null;

export function isBillingConfigured(): boolean {
	return Boolean(process.env.STRIPE_SECRET_KEY);
}

/**
 * Stripe Tax is a launch-time opt-in (it needs origin address + registrations
 * in the dashboard first), so checkout works everywhere without it and the
 * flag flips it on without a code change.
 */
export function isAutomaticTaxEnabled(): boolean {
	return process.env.STRIPE_AUTOMATIC_TAX === "true";
}

/**
 * Lazy on purpose — a missing key must only fail billing flows at their call
 * sites, never module evaluation (build, dev without Stripe env, every
 * non-billing page). API version is pinned by the installed SDK.
 */
export function getStripe(): Stripe {
	if (!process.env.STRIPE_SECRET_KEY) {
		throw new Error("STRIPE_SECRET_KEY is not set");
	}
	client ??= new Stripe(process.env.STRIPE_SECRET_KEY);
	return client;
}

import type { PriceDisplay } from "@bespoke/domain/billing/formatPrice";
import { cacheLife } from "next/cache";
import { getStripe } from "./stripe";

/**
 * No cache tag on purpose: a Stripe Price's amount/currency/recurrence are
 * immutable (price changes mean a new price id, which is a new cache key), so
 * there is no event that could invalidate this.
 */
async function getCachedPriceDisplay(priceId: string): Promise<PriceDisplay> {
	"use cache";
	cacheLife("max");

	const price = await getStripe().prices.retrieve(priceId);

	return {
		amount: price.unit_amount,
		currency: price.currency,
		interval: price.recurring?.interval ?? null,
	};
}

/**
 * Price display is decoration, never load-bearing — checkout resolves the
 * real amount on Stripe's page. A misconfigured id or a Stripe outage
 * degrades to priceless buttons instead of failing the billing page.
 */
export async function getPriceDisplayOrNull(
	priceId: string,
): Promise<PriceDisplay | null> {
	try {
		return await getCachedPriceDisplay(priceId);
	} catch (error) {
		console.warn("Could not fetch Stripe price for display", {
			priceId,
			error,
		});
		return null;
	}
}

import {
	isProActive,
	subscriptionAttention,
} from "@bespoke/schema/schema/orgSubscriptions";
import { getCachedOCRQuotaState } from "../../billing/getOCRQuotaState";
import { getCachedOrgSubscription } from "../../billing/getOrgSubscription";
import { getPriceDisplayOrNull } from "../../billing/getPriceDisplay";
import { getCachedRecipeSlotUsage } from "../../billing/getRecipeSlotUsage";
import { hasStripeCustomer } from "../../billing/hasStripeCustomer";
import { getSlotPacks } from "../../billing/slotPacks";
import { isBillingConfigured } from "../../billing/stripe";
import { protectedProcedure, router } from "../index";

export const billingRouter = router({
	config: protectedProcedure.query(async ({ ctx }) => {
		const configured = isBillingConfigured();
		const proPriceId = process.env.STRIPE_PRO_PRICE_ID;

		const [proPrice, slotPacks, hasBillingHistory] = await Promise.all([
			configured && proPriceId ? getPriceDisplayOrNull(proPriceId) : null,
			configured
				? Promise.all(
						getSlotPacks().map(async (pack) => ({
							...pack,
							price: await getPriceDisplayOrNull(pack.priceId),
						})),
					)
				: [],
			configured ? hasStripeCustomer(ctx.orgId) : false,
		]);

		return {
			billingConfigured: configured,
			proConfigured: configured && Boolean(proPriceId),
			proPrice,
			slotPacks,
			/**
			 * A Stripe Customer exists, so the Portal has something to show:
			 * pack-only buyers have invoices but no subscription row.
			 */
			hasBillingHistory,
		};
	}),
	usage: protectedProcedure.query(({ ctx }) => {
		return getCachedRecipeSlotUsage(ctx.orgId);
	}),
	ocrQuotaState: protectedProcedure.query(({ ctx }) => {
		return getCachedOCRQuotaState(ctx.orgId);
	}),
	subscription: protectedProcedure.query(async ({ ctx }) => {
		const sub = await getCachedOrgSubscription(ctx.orgId);

		if (!sub) {
			return null;
		}

		return {
			status: sub.status,
			isPro: isProActive(sub.status),
			attention: subscriptionAttention(sub.status),
			/**
			 * The mirror column is `timestamp` without tz; the driver returns it
			 * as a naive `"YYYY-MM-DD HH:MM:SS"` string (no `Z`). It was written
			 * from a UTC instant, so re-stamp it as UTC before it reaches the
			 * client — otherwise `new Date(...)` there reads it as browser-local
			 * and the renewal date can slip a day.
			 */
			currentPeriodEnd: new Date(
				`${sub.currentPeriodEnd.replace(" ", "T")}Z`,
			).toISOString(),
			cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
		};
	}),
});

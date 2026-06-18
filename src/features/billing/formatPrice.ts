import type { PriceDisplay } from "@/features/billing/api/getPriceDisplay";
import { createCurrencyFormatter } from "@/utils/formatting";

type FormattedPrice = { amount: string; interval: string | null };

export function formatPrice(
	price: PriceDisplay | null | undefined,
	locale: string,
): FormattedPrice | null {
	if (price?.amount == null) {
		return null;
	}

	return {
		amount: createCurrencyFormatter(locale, price.currency).format(
			price.amount / 100,
		),
		interval: price.interval,
	};
}

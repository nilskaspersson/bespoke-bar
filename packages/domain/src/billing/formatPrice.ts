import { createCurrencyFormatter } from "../utils/formatting";

export type PriceDisplay = {
	/** Minor units (cents); null for prices without a fixed amount. */
	amount: number | null;
	currency: string;
	interval: string | null;
};

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

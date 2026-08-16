"use client";

import {
	createCurrencyDisplayName,
	createCurrencyFormatter,
	createDateTimeFormatter,
	createPercentageFormatter,
	createQuantityFormatter,
	createRelativeTimeFormatter,
	createVolumeFormatter,
	DEFAULT_CURRENCY,
	DEFAULT_LOCALE,
} from "@bespoke/domain/utils/formatting";
import { createContext, useMemo } from "react";

export const FormatterContext = createContext({
	currencyFormatter: createCurrencyFormatter(DEFAULT_LOCALE, DEFAULT_CURRENCY),
	currencyDisplayName: createCurrencyDisplayName(DEFAULT_LOCALE),
	dateTimeFormatter: createDateTimeFormatter(DEFAULT_LOCALE),
	percentageFormatter: createPercentageFormatter(DEFAULT_LOCALE),
	quantityFormatter: createQuantityFormatter(DEFAULT_LOCALE),
	relativeTimeFormatter: createRelativeTimeFormatter(DEFAULT_LOCALE),
	volumeFormatter: createVolumeFormatter(DEFAULT_LOCALE),
	options: {
		currency: DEFAULT_CURRENCY,
		locale: DEFAULT_LOCALE,
	},
});

export function FormatterContextProvider({
	children,
	currency,
	locale,
}: {
	children: React.ReactNode;
	currency: string;
	locale: string;
}) {
	const value = useMemo(
		() => ({
			currencyFormatter: createCurrencyFormatter(locale, currency),
			currencyDisplayName: createCurrencyDisplayName(locale),
			dateTimeFormatter: createDateTimeFormatter(locale),
			percentageFormatter: createPercentageFormatter(locale),
			quantityFormatter: createQuantityFormatter(locale),
			relativeTimeFormatter: createRelativeTimeFormatter(locale),
			volumeFormatter: createVolumeFormatter(locale),
			options: {
				currency,
				locale,
			},
		}),
		[currency, locale],
	);

	return <FormatterContext value={value}>{children}</FormatterContext>;
}

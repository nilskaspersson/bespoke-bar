"use client";

import { createContext, useMemo } from "react";
import {
	createCurrencyDisplayName,
	createCurrencyFormatter,
	createDateTimeFormatter,
	createPercentageFormatter,
	createQuantityFormatter,
	createRelativeTimeFormatter,
	createVolumeFormatter,
} from "@/utils/formatting";

export const FormatterContext = createContext({
	currencyFormatter: createCurrencyFormatter("en-GB", "EUR"),
	currencyDisplayName: createCurrencyDisplayName("en-GB"),
	dateTimeFormatter: createDateTimeFormatter("en-GB"),
	percentageFormatter: createPercentageFormatter("en-GB"),
	quantityFormatter: createQuantityFormatter("en-GB"),
	relativeTimeFormatter: createRelativeTimeFormatter("en-GB"),
	volumeFormatter: createVolumeFormatter("en-GB"),
	options: {
		currency: "EUR",
		locale: "en-GB",
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

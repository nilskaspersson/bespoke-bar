import {
	createCurrencyFormatter,
	createDateTimeFormatter,
	createPercentageFormatter,
	createQuantityFormatter,
	createRelativeTimeFormatter,
	createVolumeFormatter,
	DEFAULT_CURRENCY,
	DEFAULT_LOCALE,
} from "@bespoke/domain/utils/formatting";
import { useQuery } from "@tanstack/react-query";
import { createContext, type ReactNode, use, useMemo } from "react";
import { useTRPC } from "@/trpc/client";

function createFormatters(locale: string, currency: string) {
	return {
		currency: createCurrencyFormatter(locale, currency),
		dateTime: createDateTimeFormatter(locale),
		percentage: createPercentageFormatter(locale),
		quantity: createQuantityFormatter(locale),
		relativeTime: createRelativeTimeFormatter(locale),
		volume: createVolumeFormatter(locale),
	};
}

const FormattersContext = createContext(
	createFormatters(DEFAULT_LOCALE, DEFAULT_CURRENCY),
);

export function FormattersProvider({ children }: { children: ReactNode }) {
	const trpc = useTRPC();
	const { data } = useQuery(trpc.organisation.get.queryOptions());

	const locale = data?.defaultLocale ?? DEFAULT_LOCALE;
	const currency = data?.currency ?? DEFAULT_CURRENCY;

	const formatters = useMemo(
		() => createFormatters(locale, currency),
		[locale, currency],
	);

	return <FormattersContext value={formatters}>{children}</FormattersContext>;
}

export function useFormatters() {
	return use(FormattersContext);
}

"use client";

import type { Organisation } from "@/db/schema/organisations";
import { FormatterContextProvider } from "@/hooks/useFormatter";

export function Providers({
	children,
	organisation,
}: {
	children: React.ReactNode;
	organisation: Organisation;
}) {
	return (
		<FormatterContextProvider
			currency={organisation.currency}
			locale={organisation.defaultLocale}
		>
			{children}
		</FormatterContextProvider>
	);
}

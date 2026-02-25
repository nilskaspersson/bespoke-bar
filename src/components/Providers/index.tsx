"use client";

import { LazyMotion } from "motion/react";
import { NuqsAdapter } from "nuqs/adapters/next/app";
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
			<LazyMotion
				features={() => import("./motionFeatures").then((m) => m.default)}
				strict
			>
				<NuqsAdapter>{children}</NuqsAdapter>
			</LazyMotion>
		</FormatterContextProvider>
	);
}

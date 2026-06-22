"use client";

import { initializePlatform } from "@bespoke/ui/stores/platform";
import { LazyMotion } from "motion/react";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { useEffect } from "react";
import { TRPCProvider } from "@/trpc/Provider";

export function Providers({ children }: { children: React.ReactNode }) {
	useEffect(() => {
		initializePlatform();
	}, []);

	return (
		<TRPCProvider>
			<LazyMotion
				features={() => import("./motionFeatures").then((m) => m.default)}
				strict
			>
				<NuqsAdapter>{children}</NuqsAdapter>
			</LazyMotion>
		</TRPCProvider>
	);
}

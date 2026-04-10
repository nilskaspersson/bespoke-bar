"use client";

import { LazyMotion } from "motion/react";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { useEffect } from "react";
import { initializePlatform } from "@/stores/platform";
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

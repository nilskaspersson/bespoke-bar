"use client";

import { LazyMotion } from "motion/react";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { TRPCProvider } from "@/trpc/Provider";

export function Providers({ children }: { children: React.ReactNode }) {
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

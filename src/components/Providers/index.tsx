"use client";

import { LazyMotion } from "motion/react";
import { NuqsAdapter } from "nuqs/adapters/next/app";

export function Providers({ children }: { children: React.ReactNode }) {
	return (
		<LazyMotion
			features={() => import("./motionFeatures").then((m) => m.default)}
			strict
		>
			<NuqsAdapter>{children}</NuqsAdapter>
		</LazyMotion>
	);
}

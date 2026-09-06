"use client";

import { initializePlatform } from "@bespoke/ui/stores/platform";
import { useEffect } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
	useEffect(() => {
		initializePlatform();
	}, []);

	return children;
}

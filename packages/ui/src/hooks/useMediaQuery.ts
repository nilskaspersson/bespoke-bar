"use client";

import { useCallback, useSyncExternalStore } from "react";

function getServerSnapshot(): boolean {
	return false;
}

export function useMediaQuery(query: string): boolean {
	const subscribe = useCallback(
		(onChange: () => void) => {
			const controller = new AbortController();

			window
				.matchMedia(query)
				.addEventListener("change", onChange, { signal: controller.signal });

			return () => controller.abort();
		},
		[query],
	);

	const getSnapshot = useCallback(
		() => window.matchMedia(query).matches,
		[query],
	);

	return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * Returns a `schedule(callback, delay)` function that runs `callback`
 * after `delay`ms. Each call cancels any previous pending callback —
 * the schedule is single-slot, not a queue. Pending callbacks are
 * cleared on unmount.
 */
export function useScheduledCallback() {
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		return () => {
			if (timeoutRef.current) clearTimeout(timeoutRef.current);
		};
	}, []);

	return useCallback((callback: () => void, delay: number) => {
		if (timeoutRef.current) clearTimeout(timeoutRef.current);
		timeoutRef.current = setTimeout(() => {
			timeoutRef.current = null;
			callback();
		}, delay);
	}, []);
}

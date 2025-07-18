"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Creates a permanent reference to a value, with a function to temporarily
 * override it.
 */
export function useTimedState<T>(
	originalValue: T,
	timeout: number,
): [T, (temporaryValue: T) => void] {
	const [value, setValue] = useState<T>(originalValue);
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);

	const setTimedValue = useCallback(
		(temporaryValue: T, overrideTimeout?: number) => {
			/**
			 * Clear any existing timeout
			 */
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}

			setValue(temporaryValue);

			/**
			 * Schedule a revert back to the original value
			 */
			timeoutRef.current = setTimeout(() => {
				setValue(originalValue);
			}, overrideTimeout ?? timeout);
		},
		[originalValue, timeout],
	);

	useEffect(() => {
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, []);

	return [value, setTimedValue];
}

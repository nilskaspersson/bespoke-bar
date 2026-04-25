"use client";

import { useCallback, useState } from "react";
import { useScheduledCallback } from "@/hooks/useScheduledCallback";

/**
 * Creates a permanent reference to a value, with a function to temporarily
 * override it.
 */
export function useTimedState<T>(
	originalValue: T,
	timeout: number,
): [T, (temporaryValue: T, overrideTimeout?: number) => void] {
	const [value, setValue] = useState<T>(originalValue);
	const schedule = useScheduledCallback();

	const setTimedValue = useCallback(
		(temporaryValue: T, overrideTimeout?: number) => {
			setValue(temporaryValue);
			schedule(() => setValue(originalValue), overrideTimeout ?? timeout);
		},
		[originalValue, timeout, schedule],
	);

	return [value, setTimedValue];
}

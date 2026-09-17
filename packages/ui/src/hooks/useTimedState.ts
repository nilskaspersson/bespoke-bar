"use client";

import { useCallback, useState } from "react";
import { useScheduledCallback } from "./useScheduledCallback";

/**
 * A value that can be temporarily overridden and reverts on its own. The
 * pending revert is cleared on unmount.
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

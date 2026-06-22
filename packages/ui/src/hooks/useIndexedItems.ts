import { indexBy } from "@bespoke/domain/utils/collection";
import { useMemo } from "react";

/**
 * Memoized wrapper around `indexBy` for use in components.
 */
export function useIndexedItems<T>(
	items: readonly T[] | undefined,
	getKey: (item: T) => string,
): Map<string, T> {
	return useMemo(
		() => (items ? indexBy(items, getKey) : new Map()),
		[items, getKey],
	);
}

"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

type StorageType = "local" | "session";

function resolveStorage(type: StorageType): Storage {
	return type === "session" ? sessionStorage : localStorage;
}

export function useLocalStorage<T>(
	key: string,
	initialValue: T,
	storage: StorageType = "local",
): [T, (value: T | ((prev: T) => T)) => void] {
	const subscribe = useCallback(
		(onStoreChange: () => void) => {
			const controller = new AbortController();

			window.addEventListener(
				"storage",
				(event) => {
					if (event.key === key) {
						onStoreChange();
					}
				},
				{ signal: controller.signal },
			);

			return () => controller.abort();
		},
		[key],
	);

	const getRawSnapshot = useCallback(
		() => resolveStorage(storage).getItem(key),
		[key, storage],
	);

	const raw = useSyncExternalStore(subscribe, getRawSnapshot, () => null);

	const value: T = useMemo(() => {
		if (raw === null) {
			return initialValue;
		}

		try {
			return JSON.parse(raw);
		} catch {
			return initialValue;
		}
	}, [raw, initialValue]);

	/**
	 * Mimics the useState setter fn signature, but writes to localStorage instead.
	 */
	const setValue = useCallback(
		(next: T | ((prev: T) => T)) => {
			const prev = raw === null ? initialValue : JSON.parse(raw);
			const resolved = next instanceof Function ? next(prev) : next;

			try {
				resolveStorage(storage).setItem(key, JSON.stringify(resolved));
			} catch {
				/**
				 * Fall through so the in-memory update still fires, even if we failed to persist
				 * the value.
				 */
			}

			/**
			 * Native storage events only fire in other tabs, so dispatch one locally to
			 * trigger useSyncExternalStore
			 */
			window.dispatchEvent(
				new StorageEvent("storage", {
					key,
					newValue: JSON.stringify(resolved),
				}),
			);
		},
		[key, storage, raw, initialValue],
	);

	return [value, setValue];
}

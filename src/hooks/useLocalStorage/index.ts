"use client";

import { useCallback, useSyncExternalStore } from "react";

function getServerSnapshot<T>(initialValue: T): () => T {
	return () => initialValue;
}

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

	const getSnapshot: () => T = useCallback(() => {
		const storedValue = resolveStorage(storage).getItem(key);

		if (storedValue === null) {
			return initialValue;
		}

		try {
			return JSON.parse(storedValue);
		} catch {
			return initialValue;
		}
	}, [key, initialValue, storage]);

	const value = useSyncExternalStore(
		subscribe,
		getSnapshot,
		getServerSnapshot(initialValue),
	);

	/**
	 * Mimics the useState setter fn signature, but writes to localStorage instead.
	 */
	const setValue = useCallback(
		(next: T | ((prev: T) => T)) => {
			const prev = getSnapshot();
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
		[key, storage, getSnapshot],
	);

	return [value, setValue];
}

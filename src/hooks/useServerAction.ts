"use client";

import { useTransition } from "react";

export function useServerAction<T extends unknown[], R>(
	fn: (...args: T) => Promise<R>,
	cb?: (result: R) => void,
) {
	const [isPending, startTransition] = useTransition();

	const action = async (...args: T): Promise<R> => {
		return new Promise((resolve, reject) => {
			startTransition(async () => {
				try {
					const result = await fn(...args);
					cb?.(result);
					resolve(result);
				} catch (error) {
					reject(error);
				}
			});
		});
	};

	return { action, isPending };
}

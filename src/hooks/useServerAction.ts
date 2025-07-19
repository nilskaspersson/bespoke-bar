"use client";
import { useTransition } from "react";

export function useServerAction<T extends unknown[], R>(
	fn: (...args: T) => Promise<R>,
) {
	const [isPending, startTransition] = useTransition();

	const action = async (...args: T): Promise<R> => {
		return new Promise((resolve, reject) => {
			startTransition(async () => {
				try {
					const result = await fn(...args);
					resolve(result);
				} catch (error) {
					reject(error);
				}
			});
		});
	};

	return { action, isPending };
}

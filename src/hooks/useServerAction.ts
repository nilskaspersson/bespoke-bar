"use client";

import { isRedirectError } from "next/dist/client/components/redirect-error";
import { useTransition } from "react";

export function useServerAction<T extends unknown[], R>(
	fn: (...args: T) => Promise<R>,
	cb?: (result: R | undefined) => void,
) {
	const [isPending, startTransition] = useTransition();

	const action = async (...args: T): Promise<R | undefined> => {
		return new Promise((resolve, reject) => {
			startTransition(async () => {
				try {
					const result = await fn(...args);
					cb?.(result);
					resolve(result);
				} catch (error) {
					if (isRedirectError(error)) {
						cb?.(undefined);
						resolve(undefined);
					} else {
						reject(error);
					}
				}
			});
		});
	};

	return { action, isPending };
}

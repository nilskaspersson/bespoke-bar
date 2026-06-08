import type { z } from "zod";
import {
	AppError,
	type AppErrorToast,
	getAppErrorToast,
} from "@/utils/appError";
import type { ActionResult } from "@/utils/serverAction";

/** @public */
export async function fetcher<T>(
	...args: Parameters<typeof fetch>
): Promise<T> {
	return fetch(...args).then((res) => res.json());
}

/** @public */
export function createFetcher<T>(schema: z.ZodSchema<T>) {
	return async (...args: Parameters<typeof fetcher>): Promise<T> =>
		fetcher<T>(...args).then((resp) => {
			try {
				return schema.parse(resp);
			} catch (e) {
				console.error(e);
				return resp;
			}
		});
}

export function errorMessageOrFallback(
	error: unknown,
	fallback: string,
): string {
	return (error instanceof Error ? error.message : fallback) ?? fallback;
}

/**
 * Resolves an unknown error into a `{ message, description }` toast-data pair.
 */
export function getErrorToast(
	error: unknown,
	fallback: AppErrorToast,
): AppErrorToast {
	if (error instanceof AppError) {
		return getAppErrorToast(error.payload);
	}

	return {
		message: fallback.message,
		description: errorMessageOrFallback(error, fallback.description),
	};
}

/**
 * Converts an `ActionResult` returned from a `catchKnownErrors`-wrapped server
 * action into a promise that resolves to the data (or rejects with a regular
 * Error). This is done to support rich server errors in toast.promise, without
 * triggering React error boundaries.
 */
export async function unwrapAction<T>(p: Promise<ActionResult<T>>): Promise<T> {
	const result = await p;

	if (!result.ok) {
		throw new AppError(result.error);
	}

	return result.data;
}

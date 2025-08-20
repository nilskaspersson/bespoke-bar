import type { z } from "zod";

export async function fetcher<T>(
	...args: Parameters<typeof fetch>
): Promise<T> {
	return fetch(...args).then((res) => res.json());
}

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

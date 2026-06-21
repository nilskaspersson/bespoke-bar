import type { AppErrorPayload } from "@bespoke/schema/appError";
import { AppError } from "@/utils/appError";

export type ActionResult<T> =
	| { ok: true; data: T }
	| { ok: false; error: AppErrorPayload };

/**
 * Wraps a server-action body so `AppError` throws are caught and returned as a
 * structured `ActionResult` before they cross the framework boundary. Unknown
 * errors continue to throw and surface in `error.tsx`.
 *
 * Use `unwrapAction` on the client to convert the structured payload back into
 * a thrown `AppError` for `toast.promise`-style UX.
 */
export async function catchKnownErrors<T>(
	fn: () => Promise<T>,
): Promise<ActionResult<T>> {
	try {
		const data = await fn();

		return {
			ok: true,
			data,
		};
	} catch (error) {
		if (error instanceof AppError) {
			return {
				ok: false,
				error: error.payload,
			};
		}

		throw error;
	}
}

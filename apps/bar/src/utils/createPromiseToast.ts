import type { AppErrorToast } from "@bespoke/schema/appError";
import { toast } from "@bespoke/ui/Toast";
import { getErrorToast } from "@/utils/api";

type PromiseToastOptions<T> = NonNullable<
	Parameters<typeof toast.promise<T>>[1]
>;

type CreatePromiseToastOptions<T> = Pick<
	PromiseToastOptions<T>,
	"loading" | "success"
> & {
	error: AppErrorToast;
	toastId?: string;
	onSuccess?: (data: T) => void | Promise<void>;
};

/**
 * Wires a server-action promise into `toast.promise` with AppError-aware error
 * handling baked in, and swallows the rejection so it doesn't bubble to
 * `error.tsx`.
 */
export async function createPromiseToast<T>(
	promise: Promise<T>,
	{
		loading,
		success,
		error,
		toastId = Date.now().toString(),
		onSuccess,
	}: CreatePromiseToastOptions<T>,
): Promise<void> {
	toast.promise(promise, {
		id: toastId,
		loading,
		success,
		error: (thrown) => getErrorToast(thrown, error),
	});

	try {
		const data = await promise;
		await onSuccess?.(data);
	} catch {
		// Surfaced via the toast above; swallow so it doesn't reach error.tsx.
	}
}

import { toast } from "@bespoke/ui/Toast";
import { getErrorToast, unwrapAction } from "@/utils/api";
import type { ActionResult } from "@/utils/serverAction";

export function navigateToStripe(
	action: Promise<ActionResult<{ url: string }>>,
	loading: string,
	errorMessage: string,
) {
	const promise = unwrapAction(action).then(({ url }) => {
		window.location.assign(url);
	});

	toast.promise(promise, {
		loading,
		success: () => ({ message: "Redirecting to Stripe…" }),
		error: (error) =>
			getErrorToast(error, {
				message: errorMessage,
				description: "Try again later.",
			}),
	});

	return promise.catch(() => {
		// Surfaced via the toast; swallow so it doesn't reach error.tsx.
	});
}

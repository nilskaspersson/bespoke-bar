import { unwrapAction } from "@/utils/api";
import { createPromiseToast } from "@/utils/createPromiseToast";
import type { ActionResult } from "@/utils/serverAction";

export function navigateToStripe(
	action: Promise<ActionResult<{ url: string }>>,
	loading: string,
	errorMessage: string,
) {
	const promise = unwrapAction(action).then(({ url }) => {
		window.location.assign(url);
	});

	return createPromiseToast(promise, {
		loading,
		success: () => ({ message: "Redirecting to Stripe…" }),
		error: {
			message: errorMessage,
			description: "Try again later.",
		},
	});
}

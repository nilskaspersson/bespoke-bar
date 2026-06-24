"use client";

import { toast } from "@bespoke/ui/Toast";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

function CheckoutResultToastInner() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const pathname = usePathname();
	const checkout = searchParams.get("checkout");

	useEffect(() => {
		if (!checkout) {
			return;
		}

		if (checkout === "success") {
			toast.success("Checkout complete", {
				description:
					"Your plan and slots update as soon as payment is confirmed — usually within seconds.",
			});
		} else if (checkout === "cancelled") {
			toast.info("Checkout cancelled", {
				description: "You haven't been charged.",
			});
		}

		router.replace(pathname, { scroll: false });
	}, [checkout, router, pathname]);

	return null;
}

/**
 * Toasts the result of a hosted Checkout round-trip (`?checkout=success` /
 * `?checkout=cancelled` on the return URL), then strips the param. Suspense
 * because `useSearchParams` bails out of static rendering without it.
 */
export function CheckoutResultToast() {
	return (
		<Suspense fallback={null}>
			<CheckoutResultToastInner />
		</Suspense>
	);
}

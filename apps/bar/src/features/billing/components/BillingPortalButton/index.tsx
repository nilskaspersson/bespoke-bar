"use client";

import { Button, type ButtonProps } from "@bespoke/ui/Button";
import { useTransition } from "react";
import { createBillingPortalSession } from "@/features/billing/api/createBillingPortalSession";
import { navigateToStripe } from "@/features/billing/navigateToStripe";

function useOpenPortal() {
	const [isPending, startTransition] = useTransition();

	function openPortal() {
		startTransition(() =>
			navigateToStripe(
				createBillingPortalSession(),
				"Opening billing portal…",
				"Could not open the billing portal",
			),
		);
	}

	return { openPortal, isPending };
}

export function BillingPortalButton(props: ButtonProps) {
	const { openPortal, isPending } = useOpenPortal();

	return (
		<Button
			variant="outline"
			size="small"
			{...props}
			onClick={openPortal}
			disabled={isPending || props.disabled}
		/>
	);
}

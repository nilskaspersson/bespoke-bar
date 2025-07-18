"use client";

import { useCallback } from "react";

import { useTimedState } from "@/hooks/useTimedState";

export function useCopyToClipboard() {
	const [status, setTemporaryStatus] = useTimedState<
		"pending" | "success" | "error"
	>("pending", 2000);

	const copy = useCallback(
		async (s: unknown) => {
			try {
				if (typeof s !== "string") {
					throw new Error("Value cannot be copied");
				}

				await navigator.clipboard.writeText(s);
				setTemporaryStatus("success");
			} catch {
				setTemporaryStatus("error");
			}
		},
		[setTemporaryStatus],
	);

	return [copy, status] as const;
}

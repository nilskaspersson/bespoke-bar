"use client";

import { useCallback, useRef, useState } from "react";
import { toast } from "@/ui/Toast";
import { errorMessageOrFallback } from "@/utils/api";

export function useSubmitPhotoAction({
	onStart,
	onSuccess,
	onError,
}: {
	onStart?: () => void;
	onSuccess?: (extractedText: string) => void;
	onError?: (error: unknown) => void;
} = {}) {
	const [isPending, setIsPending] = useState(false);
	const toastIdRef = useRef<string | number | null>(null);

	const startLoading = useCallback(() => {
		const id = toast.loading("Processing image…");
		toastIdRef.current = id;
	}, []);

	const dismissLoading = useCallback(() => {
		if (toastIdRef.current != null) {
			toast.dismiss(toastIdRef.current);
			toastIdRef.current = null;
		}
	}, []);

	const submitPhotoAction = useCallback(
		async (formData: FormData) => {
			if (isPending) return;

			onStart?.();
			setIsPending(true);

			const toastId = toastIdRef.current ?? toast.loading("Processing image…");

			try {
				const res = await fetch("/api/photo/parse", {
					method: "POST",
					body: formData,
				});

				const data = await res.json();

				if (!res.ok) {
					throw new Error(data.error ?? "Failed to parse image");
				}

				toast.success("Text extracted", { id: toastId });

				if (data?.success) {
					onSuccess?.(data.extractedText);
				}
			} catch (error) {
				toast.error("Error processing image", {
					id: toastId,
					description: errorMessageOrFallback(error, "Try again later."),
				});
				onError?.(error);
			} finally {
				setIsPending(false);
				toastIdRef.current = null;
			}
		},
		[isPending, onStart, onSuccess, onError],
	);

	return { action: submitPhotoAction, isPending, startLoading, dismissLoading };
}

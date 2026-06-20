"use client";

import { useCallback, useRef, useState } from "react";
import { showOCRQuotaReachedToast } from "@/features/billing/components/OCRQuotaReachedToast";
import { trpc } from "@/trpc/client";
import { toast } from "@/ui/Toast";
import { getErrorToast } from "@/utils/api";
import { AppError, appErrorSchema } from "@/utils/appError";

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
	const utils = trpc.useUtils();

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

			await utils.billing.ocrQuotaState.cancel();
			utils.billing.ocrQuotaState.setData(undefined, (current) =>
				current && current.remaining > 0
					? {
							...current,
							used: current.used + 1,
							remaining: current.remaining - 1,
						}
					: current,
			);

			const toastId = toastIdRef.current ?? toast.loading("Processing image…");

			try {
				const res = await fetch("/api/photo/parse", {
					method: "POST",
					body: formData,
				});

				const json = await res.json();

				if (!json.ok) {
					const appError = appErrorSchema.safeParse(json.error);
					if (appError.success) {
						throw new AppError(appError.data);
					}
					throw new Error(json.error?.message ?? "Failed to parse image");
				}

				toast.success("Text extracted", { id: toastId });
				onSuccess?.(json.data.extractedText);
			} catch (error) {
				if (
					error instanceof AppError &&
					error.payload.code === "OCR_QUOTA_REACHED"
				) {
					showOCRQuotaReachedToast(error.payload, { id: toastId });
				} else {
					const { message, description } = getErrorToast(error, {
						message: "Error processing image",
						description: "Try again later.",
					});
					toast.error(message, { id: toastId, description });
				}
				onError?.(error);
			} finally {
				setIsPending(false);
				toastIdRef.current = null;
				void utils.billing.ocrQuotaState.invalidate();
			}
		},
		[isPending, onStart, onSuccess, onError, utils],
	);

	return { action: submitPhotoAction, isPending, startLoading, dismissLoading };
}

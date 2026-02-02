"use client";

import { useCallback, useTransition } from "react";
import { parseTextFromImageAction } from "@/features/recipes/photo/api/parseTextFromImageAction";
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
	const [isPending, startTransition] = useTransition();

	const submitPhotoAction = useCallback(
		(formData: FormData) => {
			if (isPending) return;

			onStart?.();

			const toastId = Date.now().toString();

			startTransition(async () => {
				try {
					const promise = parseTextFromImageAction(formData);

					toast.promise(promise, {
						id: toastId,
						loading: "Processing image…",
						success: () => ({
							message: "Text extracted",
						}),
						error: (error) => ({
							message: "Error processing image",
							description: errorMessageOrFallback(error, "Try again later."),
						}),
					});

					const parsedFile = await promise;

					if (parsedFile?.success) {
						onSuccess?.(parsedFile.extractedText);
					}
				} catch (error) {
					onError?.(error);
				}
			});
		},
		[isPending, onStart, onSuccess, onError],
	);

	return { action: submitPhotoAction, isPending };
}

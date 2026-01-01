"use client";

import { useCallback } from "react";
import { parseTextFromImageAction } from "@/features/recipes/photo/actions/parseTextFromImage";
import { useServerAction } from "@/hooks/useServerAction";
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
	const { action, isPending } = useServerAction(parseTextFromImageAction);

	const submitPhotoAction = useCallback(
		async (formData: FormData) => {
			if (isPending) return;

			onStart?.();

			const toastId = Date.now().toString();

			try {
				const promise = action(formData);

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
		},
		[action, isPending, onStart, onSuccess, onError],
	);

	return { action: submitPhotoAction, isPending };
}

"use client";

import { type FormEvent, useCallback, useTransition } from "react";
import { useConfirm } from "../hooks/useConfirm";

export function useConfirmSubmit(
	action: (formData: FormData) => Promise<void>,
) {
	const { confirmAction, ...rest } = useConfirm();
	const [isSubmitting, startTransition] = useTransition();

	const confirmSubmit = useCallback(
		async (event: FormEvent<HTMLFormElement>) => {
			if (event.target instanceof HTMLFormElement) {
				event.preventDefault();
				const formData = new FormData(event.target);

				const confirmed = await confirmAction();

				if (confirmed) {
					startTransition(async () => {
						try {
							await action(formData);
						} catch (error) {
							if (
								error instanceof Error &&
								error.message.includes("NEXT_REDIRECT")
							) {
								return;
							}

							throw error;
						}
					});
				}
			}
		},
		[action, confirmAction],
	);

	return {
		confirmSubmit,
		isSubmitting,
		...rest,
	};
}

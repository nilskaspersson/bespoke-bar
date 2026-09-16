import type { MintedHandoff } from "@bespoke/api/recipes/photo/handoff/handoff.service";
import { AppError } from "@bespoke/schema/appError";
import { toast } from "@bespoke/ui/Toast";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { showOCRQuotaReachedToast } from "@/features/billing/components/OCRQuotaReachedToast";
import { mintHandoffLink } from "@/features/recipes/photo/api/mintHandoffLink";
import { useCloseHandoffOnUnmount } from "@/features/recipes/photo/hooks/useCloseHandoffOnUnmount";
import { trpc } from "@/trpc/client";
import { getErrorToast, unwrapAction } from "@/utils/api";

function showMintError(error: unknown) {
	if (error instanceof AppError && error.payload.code === "OCR_QUOTA_REACHED") {
		showOCRQuotaReachedToast(error.payload);
		return;
	}

	const { message, description } = getErrorToast(error, {
		message: "Couldn't start the handoff",
		description: "Try again later.",
	});
	toast.error(message, { description });
}

/**
 * The Link outlives the dialog: opening again extends a live one instead of
 * minting, and only a dead one is replaced.
 */
export function useHandoffLink({ onMintFailed }: { onMintFailed: () => void }) {
	const [link, setLink] = useState<MintedHandoff | null>(null);

	const mint = useMutation({
		mutationFn: () => unwrapAction(mintHandoffLink()),
		onSuccess: setLink,
		onError: (error) => {
			showMintError(error);
			onMintFailed();
		},
	});

	const extend = trpc.handoff.extend.useMutation({
		onSuccess: ({ expiresAt }, { nonce }) => {
			if (expiresAt === null) {
				mint.mutate();
				return;
			}
			setLink((prev) =>
				prev?.nonce === nonce ? { ...prev, expiresAt } : prev,
			);
		},
	});

	const { mutate: close } = trpc.handoff.close.useMutation();

	useCloseHandoffOnUnmount(link, close);

	const settle = useCallback(() => setLink(null), []);

	return {
		link,
		isMinting: mint.isPending,
		open() {
			if (link) {
				extend.mutate({ nonce: link.nonce });
			} else {
				mint.mutate();
			}
		},
		renew() {
			if (link) close({ nonce: link.nonce });
			mint.mutate();
		},
		settle,
	};
}

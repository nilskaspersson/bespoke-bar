import type { HandoffStatus } from "@bespoke/api/recipes/photo/handoff/handoff.service";
import { toast } from "@bespoke/ui/Toast";
import { useEffect } from "react";
import { trpc } from "@/trpc/client";

/**
 * The one response-driven event in the flow: text landed, hand it up. Queries
 * have no per-response callbacks, so this is an effect on purpose. The caller
 * settles the Link on result, which changes the query key and unmounts the
 * content, so it cannot fire twice.
 */
export function useHandoffResult(
	status: HandoffStatus | undefined,
	onResult: (extractedText: string) => void,
) {
	const utils = trpc.useUtils();

	useEffect(() => {
		if (status?.phase !== "done") return;

		onResult(status.extractedText);
		toast.success("Recipe text received from handoff");
		void utils.billing.ocrQuotaState.invalidate();
	}, [status, onResult, utils]);
}

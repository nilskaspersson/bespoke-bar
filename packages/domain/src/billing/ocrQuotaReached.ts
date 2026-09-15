import type { AppErrorPayload } from "@bespoke/schema/appError";
import type { OCRQuotaState } from "./getOCRQuotaState";

export type OCRQuotaReachedPayload = Extract<
	AppErrorPayload,
	{ code: "OCR_QUOTA_REACHED" }
>;

export function ocrQuotaReachedPayload(
	state: Pick<OCRQuotaState, "limit" | "used" | "nextAvailableAt">,
	nowMs = Date.now(),
): OCRQuotaReachedPayload {
	const retryAfter = state.nextAvailableAt
		? Math.max(
				1,
				Math.ceil((new Date(state.nextAvailableAt).getTime() - nowMs) / 1000),
			)
		: 1;

	return {
		code: "OCR_QUOTA_REACHED",
		limit: state.limit,
		used: state.used,
		retryAfter,
	};
}

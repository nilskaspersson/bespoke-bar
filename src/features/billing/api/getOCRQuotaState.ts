import { getCachedOCRQuotaLimit } from "@/features/billing/api/getOCRQuotaLimit";
import { getCachedOCRQuotaUsage } from "@/features/billing/api/getOCRQuotaUsage";
import { OCR_QUOTA_WINDOW_MS } from "@/features/billing/constants";

export type OCRQuotaState = {
	limit: number;
	used: number;
	remaining: number;
	/** ISO-8601 instant the next Use unlocks; null whenever remaining > 0. */
	nextAvailableAt: string | null;
};

/**
 * Pure composition of the two cached halves into the shape the UI and endpoint
 * consume. `nextAvailableAt` is the moment the oldest counting Use exits the
 * window — an absolute instant, so the client can count down to it without
 * refetching.
 */
export function deriveOCRQuotaState({
	limit,
	used,
	oldestUseAtMs,
}: {
	limit: number;
	used: number;
	oldestUseAtMs: number | null;
}): OCRQuotaState {
	const remaining = Math.max(0, limit - used);

	const nextAvailableAt =
		remaining === 0 && oldestUseAtMs != null
			? new Date(oldestUseAtMs + OCR_QUOTA_WINDOW_MS).toISOString()
			: null;

	return { limit, used, remaining, nextAvailableAt };
}

/**
 * Composes the separately-cached limit and usage reads. Not itself cached: each
 * half owns its own `cacheLife("max")` + tag, and the two tags invalidate on
 * very different cadences (rare grants vs every Use).
 */
export async function getCachedOCRQuotaState(
	orgId: string,
): Promise<OCRQuotaState> {
	const [limit, usage] = await Promise.all([
		getCachedOCRQuotaLimit(orgId),
		getCachedOCRQuotaUsage(orgId),
	]);

	return deriveOCRQuotaState({
		limit,
		used: usage.used,
		oldestUseAtMs: usage.oldestUseAtMs,
	});
}

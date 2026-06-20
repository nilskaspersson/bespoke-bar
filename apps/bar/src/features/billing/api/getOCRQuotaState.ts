import { getCachedOCRQuotaLimit } from "@/features/billing/api/getOCRQuotaLimit";
import { getCachedOCRQuotaUsage } from "@/features/billing/api/getOCRQuotaUsage";
import {
	startOfCurrentUTCMonthMs,
	startOfNextUTCMonthMs,
} from "@/features/billing/quotaMonth";

export type OCRQuotaState = {
	limit: number;
	used: number;
	remaining: number;
	nextAvailableAt: string | null;
};

export function deriveOCRQuotaState({
	limit,
	used,
	monthStartMs,
	nowMs,
}: {
	limit: number;
	used: number;
	monthStartMs: number;
	nowMs: number;
}): OCRQuotaState {
	const usedThisMonth =
		monthStartMs === startOfCurrentUTCMonthMs(nowMs) ? used : 0;
	const remaining = Math.max(0, limit - usedThisMonth);

	const nextAvailableAt =
		remaining === 0 && limit > 0
			? new Date(startOfNextUTCMonthMs(nowMs)).toISOString()
			: null;

	return { limit, used: usedThisMonth, remaining, nextAvailableAt };
}

/**
 * Not itself cached: each half owns its own `cacheLife("max")` + tag, and the
 * two tags invalidate on very different cadences (rare grants vs every Use).
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
		monthStartMs: usage.monthStartMs,
		nowMs: Date.now(),
	});
}

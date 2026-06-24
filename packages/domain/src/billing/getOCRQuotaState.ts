import { startOfCurrentUTCMonthMs, startOfNextUTCMonthMs } from "./quotaMonth";

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
